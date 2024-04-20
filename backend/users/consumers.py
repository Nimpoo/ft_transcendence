from channels.generic.websocket import AsyncWebsocketConsumer
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

            self.room_name = self.user.login
            self.room_group_name = f"user_{self.user.login}"

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        qtype = text_data_json["query_type"]
        if qtype == "msg":
            await self.handle_message(text_data_json)

    async def disconnect(self, code):
        if self.user:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def handle_message(self, event):
        subtype = event["subtype"]
        if subtype == "privmsg":
            await self.handle_privmsg(event)
        elif subtype == "grpmsg":
            await self.handle_grpmsg(event)

            # JSON request for chat should be formatted like that :
            #   {
            #      "query_type": "msg" (the only argument available for the moment is "msg")
            #      "subtype": "privmsg" or "grpmsg"
            #       "target": "losylves"
            #       "sender": "mayoub"
            #       "content": "Bonjour les copains" (the content of the message)
            #   }

            if self.user is receiver:
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

    async def user_notification(self, event):
        await self.send(json.dumps(event.get("data")))
