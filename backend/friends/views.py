from django.forms import model_to_dict
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View
from django.utils.decorators import method_decorator
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from users.models import User
from friends.models import FriendRequest
from utils.decorators import jwt_verify, need_user

import json


@need_user
def get_friend_request(request: HttpRequest, user: User) -> JsonResponse:
    query_id = request.GET.get("user_id")

    if query_id is None:
        return JsonResponse(
            list(
                User.objects.filter(
                    id__in=user.received_friend_requests.filter(
                        status=FriendRequest.STATUS_PENDING
                    ).values_list("sender", flat=True)
                ).values("id", "login", "display_name", "created_at")
            ),
            safe=False,
        )

    try:
        return JsonResponse(
            model_to_dict(
                FriendRequest.objects.get(
                    sender=user,
                    receiver_id=query_id,
                    status__in=[
                        FriendRequest.STATUS_PENDING,
                        FriendRequest.STATUS_ACCEPTED,
                    ],
                )
            )
        )
    except FriendRequest.DoesNotExist:
        return JsonResponse(
            model_to_dict(
                get_object_or_404(
                    FriendRequest,
                    sender_id=query_id,
                    receiver=user,
                    status__in=[
                        FriendRequest.STATUS_PENDING,
                        FriendRequest.STATUS_ACCEPTED,
                    ],
                )
            )
        )


class Friend(View):
    channel_layer = get_channel_layer()

    @method_decorator((need_user), name="dispatch")
    def get(self, request: HttpRequest, user: User) -> JsonResponse:
        return JsonResponse(
            list(user.friends.values("id", "login", "display_name", "created_at")),
            safe=False,
        )

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

        if user is receiver:
            return JsonResponse(
                {"error": "Bad Request", "message": "IDs are equal."}, status=400
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

            print(f"{user.login} asked {receiver.login} as friend")

            async_to_sync(self.channel_layer.group_send)(
                f"user_{receiver.login}",
                {
                    "type": "user.notification",
                    "data": {
                        "type": "friendrequest.ask",
                        "from": model_to_dict(
                            user, fields=["id", "login", "display_name", "created_at"]
                        ),
                    },
                },
            )

            return JsonResponse(model_to_dict(friend_request))

        friend_request.status = FriendRequest.STATUS_ACCEPTED
        friend_request.save()

        user.friends.add(receiver)

        print(f"{user.login} accepted {receiver.login} as friend")

        async_to_sync(self.channel_layer.group_send)(
            f"user_{receiver.login}",
            {
                "type": "user.notification",
                "data": {
                    "type": "friendrequest.accept",
                    "from": model_to_dict(
                        user, fields=["id", "login", "display_name", "created_at"]
                    ),
                },
            },
        )

        return JsonResponse(model_to_dict(friend_request))

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

        if user is receiver:
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
                if user == friendrequest.sender:
                    friendrequest.status = FriendRequest.STATUS_CANCELED
                    print(
                        f"{user.login} canceled his friendrequest to {receiver.login}"
                    )

                    async_to_sync(self.channel_layer.group_send)(
                        f"user_{receiver.login}",
                        {
                            "type": "user.notification",
                            "data": {
                                "type": "friendrequest.cancel",
                                "from": model_to_dict(
                                    user,
                                    fields=[
                                        "id",
                                        "login",
                                        "display_name",
                                        "created_at",
                                    ],
                                ),
                            },
                        },
                    )
                else:
                    friendrequest.status = FriendRequest.STATUS_REJECTED
                    print(f"{user.login} rejected friendrequest from {receiver.login}")

                    async_to_sync(self.channel_layer.group_send)(
                        f"user_{receiver.login}",
                        {
                            "type": "user.notification",
                            "data": {
                                "type": "friendrequest.reject",
                                "from": model_to_dict(
                                    user,
                                    fields=[
                                        "id",
                                        "login",
                                        "display_name",
                                        "created_at",
                                    ],
                                ),
                            },
                        },
                    )
            case FriendRequest.STATUS_ACCEPTED:
                friendrequest.status = FriendRequest.STATUS_REMOVED
                print(f"{user.login} removed {receiver.login} from friends")

                async_to_sync(self.channel_layer.group_send)(
                    f"user_{receiver.login}",
                    {
                        "type": "user.notification",
                        "data": {
                            "type": "friendrequest.remove",
                            "from": model_to_dict(
                                user,
                                fields=["id", "login", "display_name", "created_at"],
                            ),
                        },
                    },
                )

        friendrequest.save()

        return JsonResponse(model_to_dict(friendrequest))
