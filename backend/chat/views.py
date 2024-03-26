from django.views import View
from django.shortcuts import get_object_or_404
from django.http import HttpRequest, JsonResponse
from django.utils.decorators import method_decorator

from friends.models import FriendRequest
from users.models import User
from utils.decorators import need_user

import json


class Block(View):

    @method_decorator((need_user), name="dispatch")
    def get(self, request: HttpRequest, user: User) -> JsonResponse:
        return JsonResponse(list(user.blocked.values()), safe=False)

    @method_decorator((need_user), name="dispatch")
    def post(self, request: HttpRequest, user: User) -> JsonResponse:
        if len(request.body) == 0:
            return JsonResponse(
                {"error": "Bad Request", "message": "Missing body."}, status=400
            )

        try:
            body_payload = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Bad Request", "message": "Body must be JSON."}, status=400
            )

        receiver_id = body_payload.get("user_id")

        if receiver_id is None:
            return JsonResponse(
                {"error": "Bad Request", "message": "No 'user_id' provided."},
                status=400,
            )

        receiver = get_object_or_404(User, id=receiver_id)

        if user is receiver:
            return JsonResponse(
                {"error": "Bad Request", "message": "IDs are equal."}, status=400
            )

        if user.blocked.contains(receiver):
            return JsonResponse(
                {
                    "error": "Bad Request",
                    "message": f"'{receiver.login}' is already in your blocked list.",
                },
                status=400,
            )

        if user.friends.contains(receiver):
            user.friends.remove(receiver)

            try:
                friend_request = FriendRequest.objects.get(
                    sender=user,
                    receiver=receiver,
                    status__in=[
                        FriendRequest.STATUS_PENDING,
                        FriendRequest.STATUS_ACCEPTED,
                    ],
                )
            except FriendRequest.DoesNotExist:
                friend_request = get_object_or_404(
                    FriendRequest,
                    sender=receiver,
                    receiver=user,
                    status__in=[
                        FriendRequest.STATUS_PENDING,
                        FriendRequest.STATUS_ACCEPTED,
                    ],
                )

            friend_request.status = FriendRequest.STATUS_REMOVED
            friend_request.save()

        user.blocked.add(receiver)

        print(f"{user.login} just blocked {receiver.login}")

        return JsonResponse(list(user.blocked.values()), safe=False)

    @method_decorator((need_user), name="dispatch")
    def delete(self, request: HttpRequest, user: User) -> JsonResponse:
        if len(request.body) == 0:
            return JsonResponse(
                {"error": "Bad Request", "message": "Missing body."}, status=400
            )

        try:
            body_payload = json.loads(request.body.decode("utf-8"))
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

        if not user.blocked.contains(receiver):
            return JsonResponse(
                {
                    "error": "Bad Request",
                    "message": f"'{receiver.login}' isn't in your blocked list.",
                },
                status=400,
            )

        user.blocked.remove(receiver)
        print(f"{user.login} just unblocked {receiver.login}")

        return JsonResponse(list(user.blocked.values()), safe=False)
