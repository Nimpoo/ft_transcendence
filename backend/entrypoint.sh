#!/bin/bash

python manage.py makemigrations users friends chat game
python manage.py migrate
daphne backend.asgi:application -b pong
