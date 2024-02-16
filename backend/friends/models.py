from django.db import models

from users.models import User


class FriendRequest(models.Model):

  STATUS_PENDING = 'pending'
  STATUS_ACCEPTED = 'accepted'
  STATUS_REJECTED = 'rejected'

  STATUS_CHOICES = [
    (STATUS_PENDING, 'Pending'),
    (STATUS_ACCEPTED, 'Accepted'),
    (STATUS_REJECTED, 'Rejected'),
  ]

  sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_friend_requests')
  receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_friend_requests')

  status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)

  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
   return f"{self.sender.nickname} to {self.receiver.nickname} ({self.status})"
