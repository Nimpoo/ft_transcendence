import json, jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from users.models import User
from chat.models import Chat, ChatRoom
from urllib.parse import parse_qs
from jwt import decode
from backend import settings
from django.shortcuts import get_object_or_404
from asgiref.sync import sync_to_async


class UserConsumer(AsyncWebsocketConsumer):

  async def connect(self):
    self.user: User = self.scope.get('user')

    if self.user is None:
      # No User Authenticated

      await self.close()
    else:
      # WebSocket Setup

      self.room_name = self.user.login
      self.room_group_name = f'user_{self.user.login}'

      await self.channel_layer.group_add(self.room_group_name, self.channel_name)
      await self.accept()

  async def disconnect(self, code):
    if self.user:
      await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

  async def user_notification(self, event):
    await self.send(json.dumps(event.get('data')))

class ChatConsumer(AsyncWebsocketConsumer):

  async def connect(self):
    self.room_name = self.scope['url_route']['kwargs']['room_name']
    self.room_group_name = f'chat_{self.room_name}'

    room = await sync_to_async(ChatRoom.objects.get_or_create)(name=self.room_name)
    request_token = parse_qs(self.scope['query_string'].decode('utf-8'))
    token = request_token.get('token', [''])[0]

    try:
      decoded_token = decode(token, settings.JWT_SECRET, algorithms=['HS256'])
    except jwt.exceptions.InvalidTokenError:
      await self.close()
      return

    self.scope['user'] = decoded_token.get('id')

    await self.channel_layer.group_add(self.room_group_name, self.channel_name)
    await self.accept()

    user = await sync_to_async(get_object_or_404)(User, pk=self.scope['user'])

    await sync_to_async(room[0].members.add)(user)


  async def disconnect(self, close_code):
    # Leave room group
    await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

  # Receive message from WebSocket
  async def receive(self, text_data):
    text_data_json = json.loads(text_data)
    message = text_data_json['message']

    # Send message to room group
    await self.channel_layer.group_send(
      self.room_group_name, {'type': 'chat.message', 'message': message}
    )

  # Receive message from room group
  async def chat_message(self, event):
    message = event['message']

    async def create_chat_async(message, scope, room_name):
      user_pk = scope['user']
      sender = await sync_to_async(get_object_or_404)(User, pk=user_pk)
      room = await sync_to_async(ChatRoom.objects.get_or_create)(name=room_name)
      chat = await sync_to_async(Chat.objects.create)(content=message, sender=sender, room=room[0])
      return chat

    # Send message to WebSocket
    await self.send(text_data=json.dumps({'message': message}))
    chat = await create_chat_async(message, self.scope, self.room_name)
