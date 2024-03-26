from channels.generic.websocket import AsyncWebsocketConsumer
from users.models import User
from chat.models import Chat, ChatRoom
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

    # JSON requests for chat should me formatted like that :
    #   {
    #      "query_type": "msg" (the only argument available for the moment is "msg")
    #      "subtype": "privmsg" or "grpmsg"
    #       "target": "losylves"
    #       "sender": "mayoub"
    #       "content": "Bonjour les copains" (the content of the message)
    #   }

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
        chat = await self.create_chat_async(content, self.scope, self.room_name)

    async def handle_grpmsg(self, event):
        qtype = event["query_type"]

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def create_chat_async(self, message, scope, room_name):
        room = await sync_to_async(ChatRoom.objects.get_or_create)(name=room_name)
        chat = await sync_to_async(Chat.objects.create)(
            content=message, sender=self.user, room=room[0]
        )
        return chat

    async def user_notification(self, event):
        await self.send(json.dumps(event.get("data")))


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        room = await sync_to_async(ChatRoom.objects.get_or_create)(name=self.room_name)
        request_token = parse_qs(self.scope["query_string"].decode("utf-8"))
        token = request_token.get("token", [""])[0]

        try:
            decoded_token = decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        except jwt.exceptions.InvalidTokenError:
            await self.close()
            return

        self.scope["user"] = decoded_token.get("id")

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        user = await sync_to_async(get_object_or_404)(User, id=self.scope["user"])

        await sync_to_async(room[0].members.add)(user)

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message}
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]

        async def create_chat_async(message, scope, room_name):
            user_id = scope["user"]
            sender = await sync_to_async(get_object_or_404)(User, id=user_id)
            room = await sync_to_async(ChatRoom.objects.get_or_create)(name=room_name)
            chat = await sync_to_async(Chat.objects.create)(
                content=message, sender=sender, room=room[0]
            )
            return chat

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))
        chat = await create_chat_async(message, self.scope, self.room_name)
