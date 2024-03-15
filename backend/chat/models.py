from django.db import models

from users.models import User


class ChatRoom(models.Model):
  name = models.CharField(max_length=60)
  members = models.ManyToManyField(User)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self) -> str:
    return f"{self.name} ({','.join([user.login for user in self.members.all()])})"

class Chat(models.Model):
  content = models.TextField()
  sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
  room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self) -> str:
    return f'{self.room.name} - {self.sender} - {self.content}'
