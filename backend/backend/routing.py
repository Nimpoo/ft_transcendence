from django.urls import re_path

from users.consumers import UserConsumer

websocket_urlpatterns = [
  re_path(r"ws/chat/room/(?P<room_name>\w+)/$", UserConsumer.as_asgi()),
  re_path('users/', UserConsumer.as_asgi()),
]
