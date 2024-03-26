from django.urls import path, re_path

from users.consumers import UserConsumer


websocket_urlpatterns = [
  re_path(r"ws/chat/", UserConsumer.as_asgi()),
  path('users/', UserConsumer.as_asgi()),
]
