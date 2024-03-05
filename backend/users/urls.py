from django.urls import path

from . import views


urlpatterns = [
  path('', views.Index.as_view(), name='index'),
  path('<int:user_id>/', views.get_user, name='get-user'),
  path('me/', views.me, name='me'),
]
