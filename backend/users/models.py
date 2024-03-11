from django.db import models


class User(models.Model):
  nickname = models.CharField(max_length=30)
  fortytwo_id = models.IntegerField(unique=True)
  dfa_secret = models.CharField(max_length=50, null=True)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return self.nickname
