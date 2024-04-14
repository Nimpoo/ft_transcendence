from django.urls import path

from chat import views


urlpatterns = [
    path("block/", views.Block.as_view(), name="block"),
]
