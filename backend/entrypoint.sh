#!/bin/bash

python manage.py makemigrations users friends chat
python manage.py migrate
daphne backend.asgi:application -b pong
