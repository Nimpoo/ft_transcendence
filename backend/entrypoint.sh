#!/bin/bash

until nc -z -w30 postgres 5432
do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

until nc -z -w30 redis 6379
do
  echo "Waiting for Redis..."
  sleep 1
done


python manage.py migrate
daphne backend.asgi:application -b pong
