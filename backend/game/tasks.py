from celery import shared_task
import redis, time


@shared_task
def watcher():
  client = redis.Redis('redis', port=6379, decode_responses=True)
  queue = 'queue'

  # client.delete(queue)

  # in_queue = client.lrange(queue, 0, -1)
  # print(f'this is the QUEUE: \'{queue}\', and this is elements of the QUEUE: {in_queue}')

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
    return
