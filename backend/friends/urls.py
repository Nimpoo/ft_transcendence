from django.urls import path

from friends import views


urlpatterns = [
  path('<int:user_id>/', views.get_user_friends_list, name='get-friends-list'),
  path('add/', views.add_friend, name='add-friend'),
  path('reject/', views.reject_friend, name='reject-friend'),
  path('remove/', views.remove_friend, name='remove-friend'),
]
