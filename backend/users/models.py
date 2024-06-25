from django.db import models


class User(models.Model):
    login = models.CharField(max_length=30, unique=True)
    display_name = models.CharField(max_length=30)
    avatar = models.ImageField(null=True, blank=False, upload_to="avatars")

    fortytwo_id = models.IntegerField(unique=True)
    dfa_secret = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    friends = models.ManyToManyField("self")

    trophies = models.IntegerField(default=0)
    highest_trophies = models.IntegerField(default=0)

    @property
    def games_played(self) -> int:
        from game.models import Game

        return len(Game.objects.filter(models.Q(player_1=self) | models.Q(player_2=self)))

    @property
    def victories(self) -> int:
        from game.models import Game

        return len([game for game in Game.objects.filter(models.Q(player_1=self) | models.Q(player_2=self)) if game.winner.id == self.id])

    @property
    def defeats(self) -> int:
        from game.models import Game

        return len([game for game in Game.objects.filter(models.Q(player_1=self) | models.Q(player_2=self)) if game.looser.id == self.id])

    def __str__(self) -> str:
        return self.login
