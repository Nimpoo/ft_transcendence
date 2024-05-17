from rest_framework import serializers
from friends.models import FriendRequest


class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ("id", "sender", "receiver", "status", "created_at")
