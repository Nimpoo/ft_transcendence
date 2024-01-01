#!/bin/bash

# Waiting for PostgreSQL
until nc -z -w30 postgres 5432
do
  echo "Attente de PostgreSQL..."
  sleep 1
done

python manage.py makemigrations users
python manage.py migrate

python manage.py runserver pong:8000
