from django.urls import path

from chat import views


urlpatterns = [
  path('getconv/', views.get_conv, name='get_conv'),
  path('getconvs/', views.get_all_convs, name='get_all_conv'),

  # path('blocked/', views.get_user_blocked_list, name='get-blocked-list'),
  # path('unblock/', views.unblock, name='unblock'),
  # path('block_check/')
  # todo: block and unblock functionalities
  # todo: send
  # todo: get message history
  path("block/", views.Block.as_view(), name="block"),
]
