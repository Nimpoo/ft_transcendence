from django.db import models


class User(models.Model):
    login = models.CharField(max_length=30, unique=True)
    display_name = models.CharField(max_length=30)
    avatar = models.ImageField(null=True, blank=False, upload_to="avatars")

    fortytwo_id = models.IntegerField(unique=True)
    dfa_secret = models.CharField(max_length=50, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    friends = models.ManyToManyField("self", blank=True, symmetrical=True)
    blocked = models.ManyToManyField("self", blank=True, symmetrical=False)

    def __str__(self) -> str:
        return self.login
