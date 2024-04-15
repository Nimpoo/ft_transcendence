from celery import shared_task
import redis, time

from users.models import User


@shared_task
def watcher():
  print(User.objects.all())
  client = redis.Redis('redis', port=6379, decode_responses=True)
  queue = 'queue'
  lock_key = 'watcher_key'

  if client.get(lock_key):
    print('The matchmaking is already launch.')
    return

  # client.delete(queue)

  # in_queue = client.lrange(queue, 0, -1)
  # print(f'this is the QUEUE: \'{queue}\', and this is elements of the QUEUE: {in_queue}')

  client.set(lock_key, 'true')

  try:
    while client.llen(queue) > 0:
      in_queue = client.lrange(queue, 0, -1)
      print(f'\'{queue}\': {in_queue}')
      time.sleep(1)

      # if client.lpop(queue) is None:
      #   break

  except Exception as e:
    print(f'ERROR REDIS: {e}')
    return

  finally:
    client.delete(lock_key)


# from celery import shared_task
# import redis, time


# @shared_task
# async def watcher():
#   client = await redis.from_url('redis://localhost:6379', encoding='utf-8', decode_responses=True)
#   queue = 'queue'
#   lock_key = 'watcher_key'

#   if await client.get(lock_key, 'true', nx=True, ex=30):
#     print('The matchmaking is already launch.')
#     return

#   # client.delete(queue)

#   # in_queue = client.lrange(queue, 0, -1)
#   # print(f'this is the QUEUE: \'{queue}\', and this is elements of the QUEUE: {in_queue}')

#   await client.set(lock_key, 'true')

#   try:
#     while True:
#       in_queue = client.lrange(queue, 0, -1)
#       print(f'\'{queue}\': {in_queue}')

#   except Exception as e:
#     print(f'ERROR REDIS: {e}')
#     return

#   finally:
#     await client.delete(lock_key)

