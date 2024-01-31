from django.urls import path

from . import views


urlpatterns = [
  path('', views.Index.as_view(), name='index'),
  path('<int:user_id>/', views.get_user, name='get-user'),
  path('me/', views.me, name='me'),
  path('dfa/', views.DFA.as_view(), name='dfa'),
  path('friends/<int:user_id>/', views.get_user_friends_list, name='friends-list'),
  path('friends/add/', views.add_friend, name='add-friend'),
  path('friends/reject/', views.reject_friend, name='reject-friend'),
  path('friends/remove/', views.remove_friend, name='remove-friend'),
]
