from django.urls import path

from users.consumers import UserConsumer


websocket_urlpatterns = [
    path("users/", UserConsumer.as_asgi()),
]
