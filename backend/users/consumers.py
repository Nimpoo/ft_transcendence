from channels.generic.websocket import AsyncWebsocketConsumer
from django.shortcuts import get_object_or_404
from asgiref.sync import sync_to_async

from chat.serializers import ChatSerializer
from users.models import User
from users.serializers import UserSerializer
from chat.models import Chat

import json


class UserConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user: User = self.scope.get("user")

        if self.user is None:
            # No User Authenticated

            await self.close()
        else:
            # WebSocket Setup
            all_consumers.append(self)

            self.room_name = self.user.login
            self.room_group_name = f"user_{self.user.login}"

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

    async def receive(self, text_data):
        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(
                json.dumps({"type": "error", "message": "Please provide a valid json"})
            )
            return

        payload_type = payload.get("type")
        match payload_type:
            case "message.send":
                await self.handle_message(payload)

            case _:
                await self.send(
                    json.dumps(
                        {
                            "type": "user.notification",
                            "data": {
                                "type": "error",
                                "message": f"Unkonw type: '{payload_type}'",
                            },
                        }
                    )
                )

    async def disconnect(self, code):
        if self.user:
            all_consumers.remove(self)
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def handle_message(self, event):
        target_id = event.get("target_id")
        content = event.get("content")

        if target_id is None:
            await self.send(
                json.dumps({"type": "error", "message": "Please provide `target_id`"})
            )
            return

        if content is None:
            await self.send(
                json.dumps({"type": "error", "message": "Please provide `content`"})
            )
            return

        try:
            receiver = await sync_to_async(User.objects.get)(id=target_id)
        except User.DoesNotExist:
            await self.send(
                json.dumps({"type": "error", "message": "targeted user does not exist"})
            )
            return

        if self.user.id == receiver.id:
            await self.send(
                json.dumps(
                    {"type": "error", "message": "You cannot send message to yourself"}
                )
            )
            return

        chat = await sync_to_async(Chat.objects.create)(
            sender=self.user, receiver=receiver, content=content
        )

        chat_serialized = ChatSerializer(chat)

        await self.channel_layer.group_send(
            f"user_{self.user.login}",
            {
                "type": "user.notification",
                "data": {
                    "type": "message.sent",
                    "message": await sync_to_async(chat_serialized.__getattribute__)("data"),
                },
            },
        )

        await self.channel_layer.group_send(
            f"user_{receiver.login}",
            {
                "type": "user.notification",
                "data": {
                    "type": "message.receive",
                    "message": await sync_to_async(chat_serialized.__getattribute__)("data"),
                },
            },
        )

    async def user_notification(self, event):
        await self.send(json.dumps(event.get("data")))


all_consumers: list[UserConsumer] = []
