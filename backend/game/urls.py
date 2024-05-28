from django.urls import path

from game import views


urlpatterns = [
  path("", views.get_games, name="get_games"),
]
