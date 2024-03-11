import json

from channels.generic.websocket import AsyncWebsocketConsumer

class UserConsumer(AsyncWebsocketConsumer):

  async def connect(self):
    print('new connection')
    await self.accept()

  async def disconnect(self, close_code):
    print('disconnected')

  async def receive(self, text_data: str):
    try:
      data = json.loads(text_data)
      print(f'recieved: {data}')
    except json.JSONDecodeError:
      print(f'recieved: \'{text_data.strip()}\'')
