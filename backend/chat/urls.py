from django.urls import path

from chat import views

urlpatterns = [
  path('blocked/', views.get_user_blocked_list, name='get-blocked-list'),
  path('block/', views.block, name='block'),
  path('unblock/', views.unblock, name='unblock'),
  # path('block_check/')
  # todo: block and unblock functionalities
  # todo: send
  # todo: get message history
]