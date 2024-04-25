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
            "fortytwo_id",
            "dfa_secret",
            "created_at",
            "friends",
            "blocked",
        )
        depth = 1
