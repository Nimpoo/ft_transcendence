from rest_framework import serializers
from users.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "login",
            "display_name",
            "avatar",
            "trophies",
            "highest_trophies",
            "games_played",
            "victories",
            "defeats",
            "created_at",
        )
