from django.urls import re_path

from users.consumers import UserConsumer

websocket_urlpatterns = [
  re_path('users/', UserConsumer.as_asgi()),
]
