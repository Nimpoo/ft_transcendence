from channels.generic.websocket import AsyncWebsocketConsumer
from django.shortcuts import get_object_or_404
from django.forms import model_to_dict
from asgiref.sync import sync_to_async

from users.models import User
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

    async def handle_privmsg(self, event):
        qtype = event["query_type"]
        subtype = event["subtype"]
        sender = event["sender"]
        target = event["target"]
        content = event["content"]
        channel_name = f"user_{target}"
        await self.channel_layer.group_send(
            channel_name,
            {
                "type": "chat.message",
                "query_type": qtype,
                "sub_type": subtype,
                "sender": sender,
                "content": content,
            },
        )
        await self.create_chat_async(content, sender, target)

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
            receiver = await sync_to_async(User.objects.get)(login=receiver_id)
        except User.DoesNotExist:
            await self.send(
                json.dumps({"type": "error", "message": "targeted user does not exist"})
            )
            return
        subtype = event["subtype"]
        if subtype == "privmsg":
            await self.handle_privmsg(event)

            # JSON request for chat should be formatted like that :
            #   {
            #      "query_type": "msg" (the only argument available for the moment is "msg")
            #      "subtype": "privmsg" or "grpmsg"
            #       "target": "losylves"
            #       "sender": "mayoub"
            #       "content": "Bonjour les copains" (the content of the message)
            #   }

            if self.user.id is receiver.id:
                await self.send(
                    json.dumps(
                        {
                            "type": "error",
                            "message": "You cannot send message to yourself",
                        }
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
                            receiver,
                            fields=[
                                "id",
                                "login",
                                "display_name",
                                "avatar_url",
                                "created_at",
                            ],
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
                            self.user,
                            fields=[
                                "id",
                                "login",
                                "display_name",
                                "avatar_url",
                                "created_at",
                            ],
                        ),
                        "content": content,
                    },
                },
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def create_chat_async(self, message, sender, receiver):
        user_receiver = await sync_to_async(get_object_or_404)(
            User, display_name=receiver
        )
        user_sender = await sync_to_async(get_object_or_404)(User, display_name=sender)
        chat = await sync_to_async(Chat.objects.create)(
            content=message, sender=user_sender, receiver=user_receiver
        )

    async def user_notification(self, event):
        await self.send(json.dumps(event.get("data")))

all_consumers: list[UserConsumer] = []
