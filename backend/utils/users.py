from users.models import User


def get_user_by_id(user_id: int):
  print(f'fetching info about user (pk={user_id})')
  user = User.objects.get(pk=user_id)
  return user
