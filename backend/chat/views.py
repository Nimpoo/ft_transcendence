from django.shortcuts import get_object_or_404
from django.http import HttpRequest, JsonResponse
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.http import require_GET
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import json

from chat.serializers import ChatSerializer
from friends.models import FriendRequest
from users.models import User
from chat.models import Chat
from users.serializers import UserSerializer
from utils.decorators import need_user


@require_GET
@need_user
def get_conv(request: HttpRequest, user: User) -> JsonResponse:
    target_id = request.GET.get("user")

    if target_id is None:
        return JsonResponse(
            {"error": "Bad Request", "message": "You must provide `user`."}, status=400
        )

    try:
        target = User.objects.get(id=target_id)
    except User.DoesNotExist:
        return JsonResponse(
            {"error": "Not Found", "message": "The provided id does not match a user."},
            status=404,
        )

    all_user_chat = Chat.objects.filter(
        Q(sender=target, receiver=user) | Q(receiver=target, sender=user)
    )
    chat_list = [ChatSerializer(chat).data for chat in all_user_chat]

    return JsonResponse(chat_list, safe=False)


@require_GET
@need_user
def get_all_convs(request: HttpRequest, user: User) -> JsonResponse:
    crspdts = User.objects.filter(
        id__in=[chat.sender.id for chat in user.received_messages.all()]
        + [chat.receiver.id for chat in user.sent_messages.all()]
    )

    chats = [
        ChatSerializer(
            Chat.objects.filter(
                Q(sender=user, receiver=crspdt) | Q(sender=crspdt, receiver=user)
            )
            .order_by("-id")
            .first()
        ).data
        for crspdt in crspdts
    ]

    return JsonResponse(chats, safe=False)
