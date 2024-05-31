from django.urls import path

from users.consumers import UserConsumer
from game.consumers import GameConsumer


websocket_urlpatterns = [
    path("users/", UserConsumer.as_asgi()),
    path('game/', GameConsumer.as_asgi()),
]
