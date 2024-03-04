from django.urls import re_path

from users import user_consumer

websocket_urlpatterns = [
	re_path(r"ws/chat/(?P<room_name>\w+)/$", user_consumer.ChatConsumer.as_asgi()),
]