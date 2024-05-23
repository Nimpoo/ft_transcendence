from channels.generic.websocket import AsyncWebsocketConsumer

import json, asyncio, math
from uuid import uuid4


WAITING_ROOMS = []

MAX_BOUNCE_ANGLE = 5 * math.pi / 12
ACCELERATION_FACTOR = 1.10
MAX_SPEED = 0.015

class GameConsumer(AsyncWebsocketConsumer):

############# ? Channel Send Message ? ##############
  async def game_paddles(self, text_data):
    for room in WAITING_ROOMS:
      if room['room_uuid'] == self.room_group_name.split('_')[-1] and self.username in room['players'] and text_data['player'] == '2':
        try:
          if text_data['key'] == 'up' and self.py_2 <= 1:
            if (self.py_2 - self.ph / 2) - 0.01 <= 0:
              self.py_2 = 0 + self.ph / 2
            else:
              self.py_2 -= 0.021

          elif text_data['key'] == 'down' and self.py_2 >= 0:
            if (self.py_2 + self.ph / 2) + 0.01 >= 1:
              self.py_2 = 1 - self.ph / 2
            else:
              self.py_2 += 0.021

        except Exception as e:
          print(e)

  async def game_quit(self, text_data):
    await self.send(json.dumps(text_data))

  async def game_join(self, text_data):
    await self.send(json.dumps(text_data))
    
  async def game_update(self, text_data):
    await self.send(json.dumps(text_data))
    
  async def game_point(self, text_data):
    await self.send(json.dumps(text_data))
    
  async def game_break(self, text_data):
    try:
      cancel = self.loop.cancel()
      print(f'cancel [CHANNELS]: {cancel}')
    except Exception as e:
      pass
###################################################?

  async def game_begin(self, text_data=None):
    self.score1 = 0
    self.score2 = 0

    await self.channel_layer.group_send(self.room_group_name, {
      'type': 'game.point',
      'player': '1',
      'score1': '0',
    })

    await self.channel_layer.group_send(self.room_group_name, {
      'type': 'game.point',
      'player': '2',
      'score2': '0',
    })
    self.loop = asyncio.create_task(self.game_loop()) # ? Line 60

####################################################
####################################################
  async def game_loop(self):
    try:
      self.x, self.y = 1 / 2, 1 / 2
      self.w, self.h = 1 / 35, 1 / 35
      self.vx, self.vy = (1 / 200), 0

      self.px_1, self.py_1 = 1 / 30, 1 / 2
      self.px_2, self.py_2 = 29 / 30, 1 / 2
      self.pw, self.ph = 1 / 125, 1 / 5

      ball_info = {
        'coordinates': [self.x, self.y],
        'dimensions': [self.w, self.h],
        'speed': [self.vx, self.vy],
        'paddle_coord_1': [self.px_1, self.py_1],
        'paddle_coord_2': [self.px_2, self.py_2],
        'paddle_dimensions': [self.pw, self.ph],
      }

      await self.channel_layer.group_send(self.room_group_name, {
        'type': 'game.update',
        'new_position': ball_info,
      })
      await self.send(text_data=json.dumps({
        'type': 'game.update',
        'new_position': ball_info,
      }))
      while True:
        await asyncio.sleep(0.016) # 60fps
        await self.update_data(ball_info) # ? Line 93
    except asyncio.CancelledError:
      print('GAME LOOP WAS INTERUPTED')
      del ball_info, self.x, self.y, self.w, self.h, self.py_1, self.py_2, self.px_1, self.px_2, self.loop

      pass
####################################################
####################################################
  async def update_data(self, ball_info: dict[str, list[float]]):

    # ? Player 1 paddle collision
    if self.x + self.vx + -(self.w / 2) < self.px_1 + -(self.pw / 2):
      if self.py_1 - (self.ph / 2) < self.y + self.vy < self.py_1 + (self.ph / 2):
        relative_intersect_y = (self.py_1 - self.y) / (self.ph / 2)
        bounce_angle = relative_intersect_y * MAX_BOUNCE_ANGLE
        self.vx = self.ball_speed * math.cos(bounce_angle)
        self.vy = -self.ball_speed * math.sin(bounce_angle)
        if self.ball_speed <= MAX_SPEED:
          self.ball_speed *= ACCELERATION_FACTOR
    # ?

    # ? Player 2 paddle collision
    if self.x + self.vx + (self.w / 2) > self.px_2 + (self.pw / 2):
      if self.py_2 - (self.ph / 2) < self.y + self.vy < self.py_2 + (self.ph / 2):
        relative_intersect_y = (self.py_2 - self.y) / (self.ph / 2)
        bounce_angle = relative_intersect_y * MAX_BOUNCE_ANGLE
        self.vx = -self.ball_speed * math.cos(bounce_angle)
        self.vy = -self.ball_speed * math.sin(bounce_angle)
        if self.ball_speed <= MAX_SPEED:
          self.ball_speed *= ACCELERATION_FACTOR
    # ?

    # ? Collision woth the top or bot of the screen
    if (self.y + self.vy + (self.h / 2) > 1 or self.y + self.vy - (self.h / 2) < 0):
      self.vy *= -1
    # ?

    # * ball in the P2 side ---> P1 hit the point
    if self.x + self.vx + (self.w / 2) > 1.01:
      for room in WAITING_ROOMS:
        if room['room_uuid'] == self.room_group_name.split('_')[-1] and self.username in room['players']:
          self.score1 += 1
          await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game.point',
            'player': '1',
            'score1': self.score1,
          })
      self.vx *= -1
    # *

    # * ball in the P1 side ---> P2 hit the point
    if self.x + self.vx - (self.w / 2) < -0.01:
      for room in WAITING_ROOMS:
        if room['room_uuid'] == self.room_group_name.split('_')[-1] and self.username in room['players']:
          self.score2 += 1
          await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game.point',
            'player': '2',
            'score2': self.score2,
          })
      self.vx *= -1
    # *

    self.x += self.vx
    self.y += self.vy

    ball_info['coordinates'] = [self.x, self.y]
    ball_info['dimensions'] = [self.w, self.h]
    ball_info['speed'] = [self.vx, self.vy]
    ball_info['paddle_coord_1'] = [self.px_1, self.py_1]
    ball_info['paddle_coord_2'] = [self.px_2, self.py_2]
    ball_info['paddle_dimensions'] = [self.pw, self.ph]

    await self.channel_layer.group_send(self.room_group_name, {
      'type': 'game.update',
      'new_position': ball_info,
    })
    await self.send(text_data=json.dumps({
      'type': 'game.update',
      'new_position': ball_info,
    }))
####################################################
####################################################

################## * Connection * ##################
  async def connect(self):
    self.ball_speed = 0.005
    await self.accept()
###################################################*

#################### ? Receive ? ###################
  async def receive(self, text_data=None, bytes_data=None):
    data = json.loads(text_data)
    self.username = data.get('user', 'unknown_player')
    ############## Paddles Movements ###############
    if data['type'] == 'game.paddle':
      for room in WAITING_ROOMS:
        if room['room_uuid'] == self.room_group_name.split('_')[-1] and self.username in room['players'] and data['player'] == '1':
          if data['key'] == 'up' and self.py_1 <= 1:
            if (self.py_1 - self.ph / 2) - 0.01 <= 0:
              self.py_1 = 0 + self.ph / 2
            else:
              self.py_1 -= 0.021

          elif data['key'] == 'down' and self.py_1 >= 0:
            if (self.py_1 + self.ph / 2) + 0.01 >= 1:
              self.py_1 = 1 - self.ph / 2
            else:
              self.py_1 += 0.021

          ball_info = {
            'coordinates': [self.x, self.y],
            'dimensions': [self.w, self.h],
            'speed': [self.vx, self.vy],
            'paddle_coord_1': [self.px_1, self.py_1],
            'paddle_coord_2': [self.px_2, self.py_2],
            'paddle_dimensions': [self.pw, self.ph],
          }
          await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game.update',
            'new_position': ball_info,
          })

        elif room['room_uuid'] == self.room_group_name.split('_')[-1] and self.username in room['players'] and data['player'] == '2':
          await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game.paddles',
            'key': data['key'],
            'player': '2',
          })
    ################################################

    ############### Launch The Game ################
    if data['type'] == 'game.begin':
      await self.game_begin() # ? Line 55
    ################################################

    ############### Finish The Game ################
    if data['type'] == 'game.finished':
      if hasattr(self, 'room_group_name'):
        for room in WAITING_ROOMS:
          if room['room_uuid'] == self.room_group_name.split('_')[-1] and self.username in room['players']:
            room['players'].remove(self.username)
            if not room['players']:
              WAITING_ROOMS.remove(room)
            elif room['host'] == self.username:
              room['host'] = room['players'][0]
            await self.channel_layer.group_send(self.room_group_name, {
              'type': 'game.quit',
              'players': room['players'],
              'message': f'{self.username} has left the room.',
            })
            break

        await self.channel_layer.group_discard(
          self.room_group_name,
          self.channel_name
        )
    ################################################

    ############### Creation a Room ################
    if data['type'] == 'game.create':
      self.score1, self.score2 = 0, 0
      room_uuid = uuid4()
      self.room_group_name = f'game_room_{room_uuid}'

      await self.channel_layer.group_add(
        self.room_group_name,
        self.channel_name
      )

      await self.send(text_data=json.dumps({
        'type': 'game.create',
        'room_uuid': str(room_uuid),
        'players': [self.username],
        'message': f'A new room was created by {data['user']}.',
      }))
      WAITING_ROOMS.append({
        'room_uuid': str(room_uuid),
        'host': self.username,
        'limit': 2,
        'players': [
          self.username,
        ],
      })
    ################################################

    ################ Joining a Room ################
    elif data['type'] == 'game.join':
      self.score1, self.score2 = 0, 0
      for room in WAITING_ROOMS:
        if room['room_uuid'] and len(room['players']) < room['limit']:
          self.room_group_name = f'game_room_{room['room_uuid']}'
          await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
          )
          room['players'].append(self.username)
          await self.channel_layer.group_send(self.room_group_name, {
              'type': 'game.join',
              'room_uuid': room['room_uuid'],
              'players': room['players'],
              'message': f'{data['user']} has joined the room.',
          })
          break

      else:
        await self.send(text_data=json.dumps({
          'type': 'game.null',
          'message': 'No lobby found.',
        }))
        return
    ################################################
###################################################?

################ ! Deconnection ! #################
  async def disconnect(self, close_code):
    if hasattr(self, 'room_group_name'):

      if hasattr(self, "game_loop"):
        try:
          cancel = self.loop.cancel()
          print(f'cancel [DISCONNECT]: {cancel}')
        except Exception as e:
          await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game.break',
          })
          pass

      for room in WAITING_ROOMS:
        if room['room_uuid'] == self.room_group_name.split('_')[-1] and self.username in room['players']:
          room['players'].remove(self.username)
          if not room['players']:
            WAITING_ROOMS.remove(room)
          elif room['host'] == self.username:
            room['host'] = room['players'][0]
          await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game.quit',
            'players': room['players'],
            'message': f'{self.username} has left the room.',
          })
          break

      await self.channel_layer.group_discard(
        self.room_group_name,
        self.channel_name
      )

    await self.close()
###################################################!




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
