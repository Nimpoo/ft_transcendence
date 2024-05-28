from django.http import HttpRequest, JsonResponse
from django.db.models import Q

from users.models import User
from game.models import Game
from game.serializers import GameStatSerializer


def get_games(request: HttpRequest) -> JsonResponse:
    target_id = request.GET.get("user")

    if target_id is None:
        return JsonResponse(
            {"error": "Bad Request", "message": "Missing 'user'."},
            status=400,
        )

    try:
        target = User.objects.get(id=target_id)
    except ValueError:
        return JsonResponse(
            {"error": "Bad Request", "message": "You must provide a valid integer."},
            status=400,
        )
    except User.DoesNotExist:
        return JsonResponse(
            {"error": "Not Found", "message": "The provided id does not match a user."},
            status=404
        )

    game_stats = Game.objects.filter(Q(player_1=target) | Q(player_2=target)).order_by("-id")
    return JsonResponse([GameStatSerializer(game_stat).data for game_stat in game_stats], safe=False)
