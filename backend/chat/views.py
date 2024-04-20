from django.shortcuts import get_object_or_404
from django.http import HttpRequest, JsonResponse
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.http import require_GET

import urllib.parse
import json

from friends.models import FriendRequest
from users.models import User
from chat.models import Chat
from utils.decorators import need_user


class Block(View):

    @method_decorator((need_user), name="dispatch")
    def get(self, request: HttpRequest, user: User) -> JsonResponse:
        return JsonResponse(
            list(user.blocked.values("id", "login", "display_name", "created_at")),
            safe=False,
        )

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

            friend_request.status = FriendRequest.STATUS_BLOCKED
            friend_request.save()

        user.blocked.add(receiver)

        return JsonResponse(
            list(user.blocked.values("id", "login", "display_name", "created_at")),
            safe=False,
        )

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

        return JsonResponse(
            list(user.blocked.values("id", "login", "display_name", "created_at")),
            safe=False,
        )


@require_GET
def get_conv(request: HttpRequest) -> JsonResponse:
    query_string = request.GET.urlencode()
    parsed_query = urllib.parse.parse_qs(query_string)
    target = parsed_query.get("user", [None])[0]
    me = parsed_query.get("sender", [None])[0]
    sender_chats = Chat.objects.filter(
        Q(sender__display_name__contains=target) & Q(room__name__contains=me)
    )
    room_chats = Chat.objects.filter(
        Q(room__name__contains=target) & Q(sender__display_name__contains=me)
    )
    all_user_chat = sender_chats.union(room_chats)

    chat_list = []
    for chat in all_user_chat:
        chat_dict = {
            "id": chat.id,
            "content": chat.content,
            "sender": chat.sender.display_name,
            "room": chat.room.name,
            "created_at": chat.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        chat_list.append(chat_dict)

    return JsonResponse(chat_list, safe=False, status=200)


@require_GET
def get_all_convs(request: HttpRequest) -> JsonResponse:
    query_string = request.GET.urlencode()
    parsed_query = urllib.parse.parse_qs(query_string)
    me = parsed_query.get("sender", [None])[0]

    # Get all chats involving the current user
    chats = Chat.objects.filter(Q(sender__display_name=me) | Q(room__name__contains=me))

    # Group chats by conversation (sender and receiver)
    conversation_groups = {}
    for chat in chats:
        other_user = (
            chat.room.name.split("_")[-1]
            if chat.sender.display_name == me
            else chat.sender.display_name
        )
        conversation_key = f"{me}_{other_user}"
        if conversation_key not in conversation_groups:
            conversation_groups[conversation_key] = []
        conversation_groups[conversation_key].append(chat)

    # Get the latest message for each conversation
    latest_messages = []
    for conversation_key, chats in conversation_groups.items():
        latest_chat = max(chats, key=lambda chat: chat.created_at)
        latest_messages.append(
            {
                "id": latest_chat.id,
                "content": latest_chat.content,
                "sender": latest_chat.sender.display_name,
                "room": latest_chat.room.name,
                "created_at": latest_chat.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
        )

    return JsonResponse(latest_messages, safe=False, status=200)
