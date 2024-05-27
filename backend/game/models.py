from django.db import models

from users.models import User

from uuid import uuid4
from datetime import datetime


def create_game_stats(room_uuid, player_1, player_2, score1, score2):
  user_1 = User.objects.get(login=player_1)
  user_2 = User.objects.get(login=player_2) if player_2 else None
    
  GameStats.objects.create(
    room_uuid=room_uuid,
    created_at=datetime.now(),
    player_1=user_1,
    player_2=user_2,
    score1=score1,
    score2=score2
  )

class GameStats(models.Model):
  room_uuid = models.UUIDField(default=uuid4, editable=False, unique=True)
  created_at = models.DateTimeField(auto_now_add=True)
  player_1 = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='player_1', null=True)
  player_2 = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='player_2', null=True)
  score1 = models.IntegerField(blank=False)
  score2 = models.IntegerField(blank=False)

  @property
  def winner(self):
    if self.score1 > self.score2:
      return self.player_1
    return self.player_2

  @property
  def looser(self):
    if self.score1 > self.score2:
        return self.player_2
    return self.player_1

  def __str__(self) -> str:
    return str(self.room_uuid)
