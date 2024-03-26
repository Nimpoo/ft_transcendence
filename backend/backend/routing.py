from django.urls import path, re_path

from users.consumers import UserConsumer


websocket_urlpatterns = [
    path("users/", UserConsumer.as_asgi()),
]
