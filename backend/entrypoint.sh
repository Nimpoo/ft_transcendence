#!/bin/bash

until nc -z -w30 postgres 5432
do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

python manage.py makemigrations users
python manage.py migrate
daphne backend.asgi:application -b pong
