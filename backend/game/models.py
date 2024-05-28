from django.db import models

from users.models import User

from uuid import uuid4


class Game(models.Model):
  room_uuid = models.UUIDField(default=uuid4, editable=False, unique=True)
  created_at = models.DateTimeField(auto_now_add=True)
  player_1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_1')
  player_2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_2')
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
