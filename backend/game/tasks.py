from celery import shared_task
import redis, time


@shared_task
def watcher():
  try:
    pool = redis.Redis('localhost', port=6379, decode_responses=True)

    queue = 'queue'
    pool.delete(queue)

    # in_queue = pool.lrange(queue, 0, -1)
    # print(f'this is the QUEUE: \'{queue}\', and this is elements of the QUEUE: {in_queue}')

  except Exception as e:
    print(f'ERROR REDIS: {e}')
    return

  while True:
    in_queue = pool.lrange(queue, 0, -1)
    print(f'\'{queue}\': {in_queue}')
    time.sleep(1)
