from django.contrib import admin

from chat.models import ChatRoom, Chat


admin.site.register(ChatRoom)
admin.site.register(Chat)
