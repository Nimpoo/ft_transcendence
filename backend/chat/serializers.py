from rest_framework import serializers
from chat.models import Chat
from users.serializers import UserSerializer


class ChatSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    receiver = UserSerializer()

    class Meta:
        model = Chat
        fields = (
            "id",
            "sender",
            "receiver",
            "content",
            "created_at",
        )
