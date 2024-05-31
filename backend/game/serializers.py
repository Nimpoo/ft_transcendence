from rest_framework import serializers
from game.models import Game
from users.serializers import UserSerializer


class GameStatSerializer(serializers.ModelSerializer):
    player_1 = UserSerializer()
    player_2 = UserSerializer()

    class Meta:
        model = Game
        fields = (
            "id",
            "player_1",
            "player_2",
            "score1",
            "score2",
            "room_uuid",
            "created_at",
        )
