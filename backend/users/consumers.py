from channels.generic.websocket import AsyncWebsocketConsumer
from django.forms import model_to_dict
from users.models import User
from chat.models import Chat
from urllib.parse import parse_qs
from jwt import decode
from backend import settings
from django.shortcuts import get_object_or_404
from asgiref.sync import sync_to_async

import json
import jwt


class UserConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user: User = self.scope.get("user")

        if self.user is None:
            # No User Authenticated

            await self.close()
        else:
            # WebSocket Setup

            self.room_name = self.user.login
            self.room_group_name = f"user_{self.user.login}"

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, code):
        if self.user:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

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

    async def handle_message(self, event):
        receiver_id = event.get("target")
        content = event.get("content")

        if None in [receiver_id, content]:
            await self.send(
                json.dumps(
                    {
                        "type": "error",
                        "message": "Please provide 'receiver_id' and 'content'",
                    }
                )
            )
            return

        try:
            receiver = await sync_to_async(User.objects.get)(id=receiver_id)
        except User.DoesNotExist:
            await self.send(
                json.dumps({"type": "error", "message": "targeted user does not exist"})
            )
            return

        if self.user is receiver:
            await self.send(
                json.dumps(
                    {"type": "error", "message": "You cannot send message to yourself"}
                )
            )
            return

        chat = await sync_to_async(Chat.objects.create)(
            sender=self.user, receiver=receiver, content=content
        )

        await self.channel_layer.group_send(
            f"user_{self.user.login}",
            {
                "type": "user.notification",
                "data": {
                    "type": "message.sent",
                    "to": model_to_dict(
                        receiver, fields=["id", "login", "display_name", "created_at"]
                    ),
                    "content": content,
                },
            },
        )

        await self.channel_layer.group_send(
            f"user_{receiver.login}",
            {
                "type": "user.notification",
                "data": {
                    "type": "message.receive",
                    "from": model_to_dict(
                        self.user, fields=["id", "login", "display_name", "created_at"]
                    ),
                    "content": content,
                },
            },
        )

    async def user_notification(self, event):
        await self.send(json.dumps(event.get("data")))
