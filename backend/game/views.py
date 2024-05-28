from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.db.models import Q

from game.serializers import GameStatSerializer
from users.models import User
from utils.decorators import need_user

from game.models import Game


class GameStatsView(View):

  @method_decorator(need_user, name="dispatch")
  def get(self, request, user: User):
    game_stats = Game.objects.filter(Q(player_1=user) | Q(player_2=user)).order_by("-id")
    return JsonResponse(list([GameStatSerializer(game_stat).data for game_stat in game_stats]), safe=False)
