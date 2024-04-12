#!/bin/bash

# Forked from https://raw.githubusercontent.com/AudeizReading/ft_transcendence_42/master/app/generate-env.sh

cd "$(dirname "$0")"

if [ -f ".env" ]; then
  echo ".env already exist"
  printf "overwrite? (y/N) "; read -n 1 DoIOverwrite; printf "\n"

  if [ "$DoIOverwrite" != "y" ] && [ "$DoIOverwrite" != "Y" ]; then
    exit
  fi

fi

printf "Some variables will be asked, press \`enter\` for none.\n\n"

cat << EOF > .env
# 42's api keys
CLIENT_ID=$(printf "Write your 42 uid api: " 1>&2; read api; echo $api)
CLIENT_SECRET=$(printf "Write your 42 secret api: " 1>&2; read api; echo $api)

EOF

printf "\n\e[0;32mWrite the \`redirect_uri\` that you've configured in your api's settings\e[0m\n"

cat << EOF >> .env
REDIRECT_URI=$(printf "Write your \`redirect_uri\`: " 1>&2; read api; echo $api)

EOF

printf "\n"

cat << EOF >> .env
JWT_SECRET=$(openssl rand -base64 32)

EOF

printf "Write your postgres username: " 1>&2; read PG_USER
PG_PASSWORD=$(openssl rand -base64 32)

cat << EOF >> .env
# Postgres
POSTGRES_HOST=postgres
POSTGRES_DB=ft_transcendence
POSTGRES_USER=$PG_USER
POSTGRES_PASSWORD=$PG_PASSWORD
EOF

printf "Your generated PostgreSQL password for '$PG_USER' is '$PG_PASSWORD'\n"
