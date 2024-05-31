from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from uuid import uuid4

from users.models import User
from game.models import Game

import json
import asyncio
import math
import random


WAITING_ROOMS = []

MAX_BOUNCE_ANGLE = 5 * math.pi / 12
ACCELERATION_FACTOR = 1.10
MAX_SPEED = 0.015
END_GAME = 10

class GameConsumer(AsyncWebsocketConsumer):

############# ? Channel Send Message ? ##############
  async def game_paddles(self, text_data):
    for room in WAITING_ROOMS:
      if room["room_uuid"] == self.room_group_name.split("_")[-1] and self.username in room["players"] and text_data["player"] == "2":
        try:
          if text_data["key"] == "up" and self.py_2 <= 1:
            if (self.py_2 - self.ph / 2) - 0.01 <= 0:
              self.py_2 = 0 + self.ph / 2
            else:
              self.py_2 -= 0.021

          elif text_data["key"] == "down" and self.py_2 >= 0:
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

  async def game_finished(self, text_data):
    try:
      cancel = self.loop.cancel()
      print(f"cancel [DISCONNECT]: {cancel}")
    except Exception as e:
      await self.channel_layer.group_send(self.room_group_name,{
        "type": "game.break",
      })

    try:
      for room in WAITING_ROOMS:
        if room["room_uuid"] == self.room_group_name.split("_")[-1]:
          player_1 = room["players"][0]
          player_2 = room["players"][1]
          score1 = self.score1
          score2 = self.score2

          user_1 = await sync_to_async(User.objects.get)(login=player_1)
          user_2 = await sync_to_async(User.objects.get)(login=player_2)

          trophy_change = abs(score1 - score2) * 3

          game = await sync_to_async(Game.objects.create)(
            player_1=user_1,
            player_2=user_2,
            score1=score1,
            score2=score2,
            room_uuid=room["room_uuid"],
          )

          game.winner.trophies += trophy_change
          if game.winner.highest_trophies < game.winner.trophies:
            game.winner.highest_trophies = game.winner.trophies
          await sync_to_async(game.winner.save)()

          game.looser.trophies -= trophy_change
          if game.looser.trophies < 0:
            game.looser.trophies = 0
          await sync_to_async(game.looser.save)()

          break

    except Exception as e:
      await self.send(json.dumps({'error': f'You are not the host: [{e}]'}))

    for room in WAITING_ROOMS:
      if room["room_uuid"] == self.room_group_name.split("_")[-1] and self.username in room["players"]:
        room["players"].remove(self.username)
        if not room["players"]:
          WAITING_ROOMS.remove(room)
        elif room["host"] == self.username:
          room["host"] = room["players"][0]
        await self.channel_layer.group_send(self.room_group_name, {
          "type": "game.quit",
          "players": room["players"],
          "message": f"{self.username} has left the room.",
        })
        break

    self.score1, self.score2 = 0, 0

    await self.channel_layer.group_discard(
      self.room_group_name,
      self.channel_name
    )

    await self.send(json.dumps(text_data))

  async def game_countdown(self, text_data):
    self.countdown = False

################## AT START ###################
    if text_data["when"] == "begin":
      sounds = ["", "wall", "paddle", "score"]
      for i, seconds in enumerate(range(3, -1, -1)):
        data = {
          "type": "game.countdown",
          "when": "begin",
          "seconds": seconds,
        }
        if i < len(sounds):
          data["sound"] = sounds[i]
        await self.send(text_data=json.dumps(data))
        await asyncio.sleep(1)

      self.countdown = True
####################################################

################## HIT A POINT ###################
    elif text_data["when"] == "in-game":
      for seconds in range(1, -1, -1):
        await self.send(text_data=json.dumps({
          "type": "game.countdown",
          "when": "in-game",
          "seconds": seconds,
        }))
      await asyncio.sleep(1)
      self.countdown = True
####################################################

  async def game_break(self, text_data):
    try:
      cancel = self.loop.cancel()
      print(f"cancel [CHANNELS]: {cancel}")
    except Exception as e:
      pass
###################################################?

  async def game_begin(self, text_data=None):
    self.score1 = 0
    self.score2 = 0

    await self.channel_layer.group_send(self.room_group_name, {
      "type": "game.point",
      "player": "1",
      "score1": "0",
    })

    await self.channel_layer.group_send(self.room_group_name, {
      "type": "game.point",
      "player": "2",
      "score2": "0",
    })
    self.loop = asyncio.create_task(self.game_loop()) # ? Line 60

####################################################
####################################################
  async def game_loop(self):
    update = 1
    
    try:
      self.x, self.y = 1 / 2, 1 / 2
      self.w, self.h = 1 / 35, 1 / 35
      self.vx, self.vy = (1 / 200), 0

      self.px_1, self.py_1 = 1 / 30, 1 / 2
      self.px_2, self.py_2 = 29 / 30, 1 / 2
      self.pw, self.ph = 1 / 125, 1 / 5

      ball_info = {
        "coordinates": [self.x, self.y],
        "dimensions": [self.w, self.h],
        "speed": [self.vx, self.vy],
        "paddle_coord_1": [self.px_1, self.py_1],
        "paddle_coord_2": [self.px_2, self.py_2],
        "paddle_dimensions": [self.pw, self.ph],
      }

      await self.channel_layer.group_send(self.room_group_name, {
        "type": "game.update",
        "new_position": ball_info,
        "score1": self.score1,
        "score2": self.score2,
      })
      await self.send(text_data=json.dumps({
        "type": "game.update",
        "new_position": ball_info,
        "score1": self.score1,
        "score2": self.score2,
      }))
      while True:
        # ? Countdown for starting a game and when a player hit a point
        if not self.countdown:
          await asyncio.sleep(0.016) # 60fps
          continue

        await asyncio.sleep(0.016) # 60fps
        update = await self.update_data(ball_info, update) # ? Line 99
        if update == 0:
          continue
        else:
          self.x, self.y = 1 / 2, 1 / 2
          self.w, self.h = 1 / 35, 1 / 35
          if update == 1:
            self.vx, self.vy = -(1 / 200), random.uniform(-0.005, 0.005)
          else:
            self.vx, self.vy = (1 / 200), random.uniform(-0.005, 0.005)


          self.px_1, self.py_1 = 1 / 30, 1 / 2
          self.px_2, self.py_2 = 29 / 30, 1 / 2
          self.pw, self.ph = 1 / 125, 1 / 5

          await self.channel_layer.group_send(self.room_group_name, {
            "type": "game.update",
            "new_position": ball_info,
            "score1": self.score1,
            "score2": self.score2,
          })
          await self.send(text_data=json.dumps({
            "type": "game.update",
            "new_position": ball_info,
            "score1": self.score1,
            "score2": self.score2,
          }))
          update = 0
          self.ball_speed = 0.005
          continue
    except asyncio.CancelledError:
      print("GAME LOOP WAS INTERUPTED")
      del ball_info, self.x, self.y, self.w, self.h, self.py_1, self.py_2, self.px_1, self.px_2, self.loop

      pass
####################################################
####################################################
  async def update_data(self, ball_info: dict[str, list[float]], update: int) -> int:

    # ? Player 1 paddle collision
    if self.x + self.vx + -(self.w / 2) < self.px_1 + -(self.pw / 2):
      if self.py_1 - (self.ph / 2) < self.y + self.vy < self.py_1 + (self.ph / 2):
        relative_intersect_y = (self.py_1 - self.y) / (self.ph / 2)
        bounce_angle = relative_intersect_y * MAX_BOUNCE_ANGLE
        self.vx = self.ball_speed * math.cos(bounce_angle)
        self.vy = -self.ball_speed * math.sin(bounce_angle)
        if self.ball_speed <= MAX_SPEED:
          self.ball_speed *= ACCELERATION_FACTOR

        ball_info["sound"] = "paddle"
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

        ball_info["sound"] = "paddle"
    # ?

    # ? Collision woth the top or bot of the screen
    if (self.y + self.vy + (self.h / 2) > 1 or self.y + self.vy - (self.h / 2) < 0):
      self.vy *= -1
      ball_info["sound"] = "wall"
    # ?

    # * ball in the P2 side ---> P1 hit the point
    if self.x + self.vx + (self.w / 2) > 1.01:
      for room in WAITING_ROOMS:
        if room["room_uuid"] == self.room_group_name.split("_")[-1] and self.username in room["players"]:
          self.score1 += 1
          await self.channel_layer.group_send(self.room_group_name, {
            "type": "game.point",
            "player": "1",
            "score1": self.score1,
          })
          await self.channel_layer.group_send(self.room_group_name, {
            "type": "game.countdown",
            "when": "in-game",
          })
          if self.score1 == END_GAME:
            await self.channel_layer.group_send(self.room_group_name, {
              "type": "game.finished",
              "winner": room["players"][0],
            })
          return 1
    # *

    # * ball in the P1 side ---> P2 hit the point
    if self.x + self.vx - (self.w / 2) < -0.01:
      for room in WAITING_ROOMS:
        if room["room_uuid"] == self.room_group_name.split("_")[-1] and self.username in room["players"]:
          self.score2 += 1
          await self.channel_layer.group_send(self.room_group_name, {
            "type": "game.point",
            "player": "2",
            "score2": self.score2,
          })
          await self.channel_layer.group_send(self.room_group_name, {
            "type": "game.countdown",
            "when": "in-game",
          })
          if self.score2 == END_GAME:
            await self.channel_layer.group_send(self.room_group_name, {
              "type": "game.finished",
              "winner": room["players"][1],
            })
          return 2
    # *

    self.x += self.vx
    self.y += self.vy

    ball_info["coordinates"] = [self.x, self.y]
    ball_info["dimensions"] = [self.w, self.h]
    ball_info["speed"] = [self.vx, self.vy]
    ball_info["paddle_coord_1"] = [self.px_1, self.py_1]
    ball_info["paddle_coord_2"] = [self.px_2, self.py_2]
    ball_info["paddle_dimensions"] = [self.pw, self.ph]

    await self.channel_layer.group_send(self.room_group_name, {
      "type": "game.update",
      "new_position": ball_info,
      "score1": self.score1,
      "score2": self.score2,
    })
    await self.send(text_data=json.dumps({
      "type": "game.update",
      "new_position": ball_info,
      "score1": self.score1,
      "score2": self.score2,
    }))
    if "sound" in ball_info:
      del ball_info["sound"]
    
    return 0
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
    self.username = data.get("user", "unknown_player")
    self.id = data.get("id", "ERROR")
    ############## Paddles Movements ###############
    if data["type"] == "game.paddle":
      for room in WAITING_ROOMS:
        if room["room_uuid"] == self.room_group_name.split("_")[-1] and self.username in room["players"] and data["player"] == "1":
          if data["key"] == "up" and self.py_1 <= 1:
            if (self.py_1 - self.ph / 2) - 0.01 <= 0:
              self.py_1 = 0 + self.ph / 2
            else:
              self.py_1 -= 0.021

          elif data["key"] == "down" and self.py_1 >= 0:
            if (self.py_1 + self.ph / 2) + 0.01 >= 1:
              self.py_1 = 1 - self.ph / 2
            else:
              self.py_1 += 0.021

          ball_info = {
            "coordinates": [self.x, self.y],
            "dimensions": [self.w, self.h],
            "speed": [self.vx, self.vy],
            "paddle_coord_1": [self.px_1, self.py_1],
            "paddle_coord_2": [self.px_2, self.py_2],
            "paddle_dimensions": [self.pw, self.ph],
          }
          await self.channel_layer.group_send(self.room_group_name, {
            "type": "game.update",
            "new_position": ball_info,
            "score1": self.score1,
            "score2": self.score2,
          })

        elif room["room_uuid"] == self.room_group_name.split("_")[-1] and self.username in room["players"] and data["player"] == "2":
          await self.channel_layer.group_send(self.room_group_name, {
            "type": "game.paddles",
            "key": data["key"],
            "player": "2",
          })
    ################################################

    ############### Launch The Game ################
    if data["type"] == "game.begin":
      await self.channel_layer.group_send(self.room_group_name, {
        "type": "game.countdown",
        "when": "begin",
      })
      await self.game_begin() # ? Line 55
    ################################################

    ############### Finish The Game ################
    if data["type"] == "game.finished":
      if hasattr(self, "room_group_name"):
        for room in WAITING_ROOMS:
          if room["room_uuid"] == self.room_group_name.split("_")[-1] and self.username in room["players"]:
            room["players"].remove(self.username)
            if not room["players"]:
              WAITING_ROOMS.remove(room)
            elif room["host"] == self.username:
              room["host"] = room["players"][0]
            await self.channel_layer.group_send(self.room_group_name, {
              "type": "game.quit",
              "players": room["players"],
              "message": f"{self.username} has left the room.",
            })
            break

        await self.channel_layer.group_discard(
          self.room_group_name,
          self.channel_name
        )
    ################################################

    ############## Creation of a Room ##############
    if data["type"] == "game.create":
      self.score1, self.score2 = 0, 0
      room_uuid = uuid4()
      self.room_group_name = f"game_room_{room_uuid}"

      await self.channel_layer.group_add(
        self.room_group_name,
        self.channel_name
      )

      await self.send(text_data=json.dumps({
        "type": "game.create",
        "room_uuid": str(room_uuid),
        "players": [self.username],
        "message": f"A new room was created by {data["user"]}.",
        "score1": self.score1,
        "score2": self.score2,
      }))
      WAITING_ROOMS.append({
        "room_uuid": str(room_uuid),
        "host": self.username,
        "limit": 2,
        "players": [
          self.username,
        ],
      })
    ################################################

    ################ Joining a Room ################
    elif data["type"] == "game.join":
      self.score1, self.score2 = 0, 0

    # * ############### MATCHMAKING ################
      diff = 0
      me = await sync_to_async(User.objects.get)(login=self.username)

      min_diff = float('inf')
      room_index = -1

      for i, room in enumerate(WAITING_ROOMS):
        if room["room_uuid"] and len(room["players"]) < room["limit"]:
          player_1 = await sync_to_async(User.objects.get)(login=room["players"][0])
          if len(room["players"]) == 1:

            my_trophies = me.trophies

            diff = abs(my_trophies - player_1.trophies)

            if diff < min_diff:
              min_diff = diff
              room_index = i
          else:
            player_2 = await sync_to_async(User.objects.get)(login=room["players"][1])

            diff = abs(player_1.trophies - player_2.trophies)

            if diff < min_diff:
              min_diff = diff
              room_index = i

      if room_index != -1:
        room = WAITING_ROOMS[room_index]
        self.room_group_name = f"game_room_{room["room_uuid"]}"
        await self.channel_layer.group_add(
          self.room_group_name,
          self.channel_name
        )
        room["players"].append(self.username)
        await self.channel_layer.group_send(self.room_group_name, {
          "type": "game.join",
          "room_uuid": room["room_uuid"],
          "players": room["players"],
          "message": f"{data["user"]} has joined the room.",
          "score1": self.score1,
          "score2": self.score2,
        })
    # * ############################################

      else:
        await self.send(text_data=json.dumps({
          "type": "game.null",
          "message": "No lobby found.",
        }))
        return

    ################################################
###################################################?

################ ! Deconnection ! #################
  async def disconnect(self, close_code):
    if hasattr(self, "room_group_name"):

      if hasattr(self, "game_loop"):
        try:
          cancel = self.loop.cancel()
          print(f"cancel [DISCONNECT]: {cancel}")
        except Exception as e:
          await self.channel_layer.group_send(self.room_group_name, {
            "type": "game.break",
          })
          pass

      for room in WAITING_ROOMS:
        if room["room_uuid"] == self.room_group_name.split("_")[-1] and self.username in room["players"]:
          room["players"].remove(self.username)
          if not room["players"]:
            WAITING_ROOMS.remove(room)
          elif room["host"] == self.username:
            room["host"] = room["players"][0]
          await self.channel_layer.group_send(self.room_group_name, {
            "type": "game.quit",
            "players": room["players"],
            "message": f"{self.username} has left the room.",
          })
          break

      await self.channel_layer.group_discard(
        self.room_group_name,
        self.channel_name
      )

    await self.close()
###################################################!
