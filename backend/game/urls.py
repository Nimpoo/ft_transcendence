from django.urls import path

from game import views


urlpatterns = [
  path("", views.GameStatsView.as_view(), name="index"),
]
