from channels.generic.websocket import AsyncWebsocketConsumer
import json, asyncio, redis, pickle, random
from uuid import uuid4


class GameConsumer(AsyncWebsocketConsumer):
  async def connect(self):
    self.uuid = str(uuid4())
    await self.accept()

    try:
      pool = redis.Redis('localhost', port=6379, decode_responses=True)
      queue = 'queue'
      pool.lpush(queue, self.uuid)

    except Exception as e:
      print(f'ERROR REDIS [CONSUMER]: {e}')

    await self.send(json.dumps({
      'type': 'connection_established',
      'Player One [SERVER]': 'Get Ready !',
      })
    )

  async def receive(self, text_data=None, bytes_data=None):

    print(json.loads(text_data))
    x, y = 1 / 2, 1 / 2
    w, h = 1 / 35, 1 / 35
    vx, vy = 1 / 600, 1 / 200

    ball_info = {
      'coordinates': [x, y],
      'dimensions': [w, h],
      'speed': [vx, vy],
    }

    # collision = False

    await self.send(json.dumps({
      'type': 'opening_game_data',
      'new_position': ball_info,
      })
    )

    while True:

      await asyncio.sleep(0.016) # 60 FPS

      if (x + vx + (w / 2) > 1.01 or x + vx - (w / 2) < -0.01):
        vx *= -1
        # collision = True
        # vy += random.uniform(0.0001, 0.0002)

      if (y + vy + (h / 2) > 1 or y + vy - (h / 2) < 0):
        vy *= -1
        # collision = True
        # vx += random.uniform(0.0001, 0.0002)


      # if (collision == True):
      ball_info['coordinates'] = [x, y]
      ball_info['dimensions'] = [w, h]
      ball_info['speed'] = [vx, vy]

      await self.send(json.dumps({
        'type': 'game_data',
        'new_position': ball_info,
        })
      )

      x += vx
      y += vy

        # collision = False

  async def disconnect(self, close_code):
    print({'Player One [SERVER]': 'See You Soon !'})
    await self.send(json.dumps({
      'type': 'connection_closed',
      'Player One': 'See You Soon !',
      })
    )
