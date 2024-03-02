from django.db import models
from random_username.generate import generate_username


def random_username():
  return generate_username()[0]

class User(models.Model):
  nickname = models.CharField(max_length=30, default=random_username)
  fortytwo_id = models.IntegerField(unique=True)
  dfa_secret = models.CharField(max_length=50, null=True)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return self.nickname
