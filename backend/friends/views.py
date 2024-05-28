from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View
from django.utils.decorators import method_decorator
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from friends.serializers import FriendRequestSerializer
from users.models import User
from friends.models import FriendRequest
from users.serializers import UserSerializer
from utils.decorators import need_user

import json


@need_user
def get_friend_request(request: HttpRequest, user: User) -> JsonResponse:
    query_id = request.GET.get("user")

    if query_id is None:
        return JsonResponse(
            list(
                User.objects.filter(
                    id__in=user.received_friend_requests.filter(
                        status=FriendRequest.STATUS_PENDING
                    ).values_list("sender", flat=True)
                ).values("id", "login", "display_name", "avatar", "created_at")
            ),
            safe=False,
        )

    try:
        query_user = User.objects.get(id=query_id)
    except User.DoesNotExist:
        return JsonResponse(
            {"error": "Not Found", "message": "There is no user with specified id."},
            status=404,
        )

    try:
        friendrequest = FriendRequest.objects.filter(
            Q(sender=user, receiver=query_user) | Q(sender=query_user, receiver=user)
        ).latest("id")
    except FriendRequest.DoesNotExist:
        return JsonResponse(
            {
                "error": "Not Found",
                "message": "There is no friend request between you and specified user.",
            },
            status=404,
        )

    return JsonResponse(FriendRequestSerializer(friendrequest).data)


class Friend(View):
    channel_layer = get_channel_layer()

    def get(self, request: HttpRequest) -> JsonResponse:
        target_id = request.GET.get("user")

        if target_id is None:
            return JsonResponse(
                {"error": "Bad Request", "message": "Missing 'user'."},
                status=400,
            )

        try:
            target = User.objects.get(id=target_id)
        except ValueError:
            return JsonResponse(
                {"error": "Bad Request", "message": "You must provide a valid integer."},
                status=400,
            )
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "Not Found", "message": "The provided id does not match a user."},
                status=404
            )

        return JsonResponse([UserSerializer(user).data for user in target.friends.all()], safe=False)

    @method_decorator((need_user), name="dispatch")
    def post(self, request: HttpRequest, user: User) -> JsonResponse:
        if len(request.body) == 0:
            return JsonResponse(
                {"error": "Bad Request", "message": "Missing body."}, status=400
            )

        try:
            body_payload = json.loads(request.body.decode())
        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Bad Request", "message": "Body must be JSON."}, status=400
            )

        receiver_id = body_payload.get("user_id")

        if receiver_id is None:
            return JsonResponse(
                {"error": "Bad Request", "message": "Missing required fields."},
                status=400,
            )

        receiver = get_object_or_404(User, id=receiver_id)

        if user.id == receiver.id:
            return JsonResponse(
                {"error": "Bad Request", "message": "IDs are equal."}, status=400
            )

        if user.blocked.contains(receiver):
            return JsonResponse(
                {"error": "Bad Request", "message": "you blocked him"},
                status=400,
            )

        if receiver.blocked.contains(user):
            return JsonResponse(
                {"error": "Bad Request", "message": f"{receiver.login} blocked you"},
                status=400,
            )

        if user.friends.contains(receiver):
            return JsonResponse(
                {"error": "Bad Request", "message": "Already friend."}, status=400
            )

        try:  # has receiver already sent friend request
            friend_request = FriendRequest.objects.get(
                sender=receiver, receiver=user, status=FriendRequest.STATUS_PENDING
            )
        except FriendRequest.DoesNotExist:  # else create it
            friend_request, created = FriendRequest.objects.get_or_create(
                sender=user, receiver=receiver, status=FriendRequest.STATUS_PENDING
            )

            async_to_sync(self.channel_layer.group_send)(
                f"user_{receiver.login}",
                {
                    "type": "user.notification",
                    "data": {
                        "type": "friendrequest.ask",
                        "from": UserSerializer(user).data,
                    },
                },
            )

            return JsonResponse(FriendRequestSerializer(friend_request).data)

        friend_request.status = FriendRequest.STATUS_ACCEPTED
        friend_request.save()

        user.friends.add(receiver)

        async_to_sync(self.channel_layer.group_send)(
            f"user_{receiver.login}",
            {
                "type": "user.notification",
                "data": {
                    "type": "friendrequest.accept",
                    "from": UserSerializer(user).data,
                },
            },
        )

        return JsonResponse(FriendRequestSerializer(friend_request).data)

    @method_decorator((need_user), name="dispatch")
    def delete(self, request: HttpRequest, user: User) -> JsonResponse:
        if len(request.body) == 0:
            return JsonResponse(
                {"error": "Bad Request", "message": "Missing body."}, status=400
            )

        try:
            body_payload = json.loads(request.body.decode())
        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Bad Request", "message": "Body must be JSON."}, status=400
            )

        receiver_id = body_payload.get("user_id")

        if receiver_id is None:
            return JsonResponse(
                {"error": "Bad Request", "message": "Missing required fields."},
                status=400,
            )

        receiver = get_object_or_404(User, id=receiver_id)

        if user.id == receiver.id:
            return JsonResponse(
                {"error": "Bad Request", "message": "IDs are equal."}, status=400
            )

        user.friends.remove(receiver)

        try:
            friendrequest = FriendRequest.objects.get(
                sender=user,
                receiver=receiver,
                status__in=[
                    FriendRequest.STATUS_PENDING,
                    FriendRequest.STATUS_ACCEPTED,
                ],
            )
        except FriendRequest.DoesNotExist:
            friendrequest = get_object_or_404(
                FriendRequest,
                sender=receiver,
                receiver=user,
                status__in=[
                    FriendRequest.STATUS_PENDING,
                    FriendRequest.STATUS_ACCEPTED,
                ],
            )

        match friendrequest.status:
            case FriendRequest.STATUS_PENDING:
                if user.id == friendrequest.sender.id:
                    friendrequest.status = FriendRequest.STATUS_CANCELED

                    async_to_sync(self.channel_layer.group_send)(
                        f"user_{receiver.login}",
                        {
                            "type": "user.notification",
                            "data": {
                                "type": "friendrequest.cancel",
                                "from": UserSerializer(user).data,
                            },
                        },
                    )
                else:
                    friendrequest.status = FriendRequest.STATUS_REJECTED

                    async_to_sync(self.channel_layer.group_send)(
                        f"user_{receiver.login}",
                        {
                            "type": "user.notification",
                            "data": {
                                "type": "friendrequest.reject",
                                "from": UserSerializer(user).data,
                            },
                        },
                    )
            case FriendRequest.STATUS_ACCEPTED:
                friendrequest.status = FriendRequest.STATUS_REMOVED

                async_to_sync(self.channel_layer.group_send)(
                    f"user_{receiver.login}",
                    {
                        "type": "user.notification",
                        "data": {
                            "type": "friendrequest.remove",
                            "from": UserSerializer(user).data,
                        },
                    },
                )

        friendrequest.save()

        return JsonResponse(FriendRequestSerializer(friendrequest).data)
