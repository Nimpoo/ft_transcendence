from django.urls import re_path
from game.consumers import GameConsumer

websocket_urlpatterns = [
  re_path('ws/game/', GameConsumer.as_asgi()),
]
