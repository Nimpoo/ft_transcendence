from channels.generic.websocket import AsyncWebsocketConsumer
from backend.settings import WAITING_ROOMS

import json
from uuid import uuid4


class GameConsumer(AsyncWebsocketConsumer):


  async def connect(self):
    await self.accept()

  async def receive(self, text_data=None, bytes_data=None):
    data = json.loads(text_data)
    self.username = data['user']
    if data['type'] == 'game.create':
      room_uuid = uuid4()
      self.room_group_name = f'game_room_{room_uuid}'

      await self.channel_layer.group_add(
        self.room_group_name,
        self.channel_name
      )

      await self.send(text_data=json.dumps({
        'type': 'game.create',
        'room_uuid': str(room_uuid),
        'message': f'A new room was created by {data['user']}.',
      }))
      WAITING_ROOMS.append({
        'room_uuid': str(room_uuid),
        'creator': self.username,
      })

    elif data['type'] == 'game.join':
      for i in WAITING_ROOMS:
        if i['room_uuid']:
          await self.channel_layer.group_add(
            f'game_room_{i['room_uuid']}',
            self.channel_name
          )
          WAITING_ROOMS.remove(i)
          room_uuid = (i['room_uuid'])
          break
      else:
        await self.send(text_data=json.dumps({
        'type': 'game.null',
        'message': 'No lobby found :(.',
      }))
        return

      await self.send(text_data=json.dumps({
        'type': 'game.join',
        'room_uuid': room_uuid,
        'message': f'{data['user']} has joined the room.',
      }))

  async def disconnect(self, close_code):
    if hasattr(self, 'room_group_name'):
      await self.channel_layer.group_discard(
        self.room_group_name,
        self.channel_name
      )
      for i in WAITING_ROOMS:
        if i['creator'] == self.username:
          WAITING_ROOMS.remove(i)

    await self.close()




# ! Celery in stand-by because we possibly musn't use it.
# ? But we can conserve this code for later -> the Server-Side logic game
# from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import async_to_sync
# from game.tasks import watcher

# import json, asyncio, redis
# from uuid import uuid4


# class GameConsumer(AsyncWebsocketConsumer):

#   async def connect(self):

#     await self.accept()

#     # try:
#     #   self.pool = redis.Redis('redis', port=6379, decode_responses=True)
#     #   self.queue = 'queue'
#     #   self.pool.lpush(self.queue, self.uuid)
#     #   watcher.delay()

#     # except Exception as e:
#     #   print(f'ERROR REDIS [CONSUMER]: {e}')

#     await self.send(json.dumps({
#       'type': 'connection_established',
#       'Player One [SERVER]': 'Get Ready !',
#       })
#     )

#   async def receive(self, text_data=None, bytes_data=None):

#     print(json.loads(text_data))
#     x, y = 1 / 2, 1 / 2
#     w, h = 1 / 35, 1 / 35
#     vx, vy = 1 / 600, 1 / 200

#     ball_info = {
#       'coordinates': [x, y],
#       'dimensions': [w, h],
#       'speed': [vx, vy],
#     }

#     # collision = False

#     await self.send(json.dumps({
#       'type': 'opening_game_data',
#       'new_position': ball_info,
#       })
#     )

#     # while True:

#     await asyncio.sleep(0.016) # 60 FPS

#     if (x + vx + (w / 2) > 1.01 or x + vx - (w / 2) < -0.01):
#       vx *= -1
#       # collision = True
#       # vy += random.uniform(0.0001, 0.0002)

#     if (y + vy + (h / 2) > 1 or y + vy - (h / 2) < 0):
#       vy *= -1
#       # collision = True
#       # vx += random.uniform(0.0001, 0.0002)


#     # if (collision == True):
#     ball_info['coordinates'] = [x, y]
#     ball_info['dimensions'] = [w, h]
#     ball_info['speed'] = [vx, vy]

#     await self.send(json.dumps({
#       'type': 'game_data',
#       'new_position': ball_info,
#       })
#     )

#     x += vx
#     y += vy

#       # collision = False

#   async def disconnect(self, close_code):
#     print('Enter in disconnection function.')
#     # try:
#       # self.pool.lrem(self.queue, 0, self.uuid)

#     # except Exception as e:
#     #   print(f'ERROR REDIS [DISCONNECT]: {e}')

#     async_to_sync(self.channel_layer.group_discard)(
#       self.room_group_name,
#       self.channel_name
#     )
#     print({'Player One [SERVER]': 'See You Soon !'})
#     await self.close()
