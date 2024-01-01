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
AUTH_FORTYTWO_ID="$(printf "Write your 42 uid api: " 1>&2; read api; echo $api)"
AUTH_FORTYTWO_SECRET="$(printf "Write your 42 secret api: " 1>&2; read api; echo $api)"

EOF

printf "\n"

cat << EOF >> .env
# GitHub's api keys
AUTH_GITHUB_ID="$(printf "Write your GitHub uid api: " 1>&2; read api; echo $api)"
AUTH_GITHUB_SECRET="$(printf "Write your GitHub secret api: " 1>&2; read api; echo $api)"

EOF

printf "\n"

cat << EOF >> .env
# Discord's api keys
AUTH_DISCORD_ID="$(printf "Write your Discord uid api: " 1>&2; read api; echo $api)"
AUTH_DISCORD_SECRET="$(printf "Write your Discord secret api: " 1>&2; read api; echo $api)"

EOF

printf "\n\e[34;1minfo: the \`host\` is your main page. this will be used to redirect\n\e[0m"
printf "\e[33;1mwarning: you have to set \`redirect_uri\` in your api settings at your \`host\` (e.g. http://localhost:3000)\n\e[0m"

cat << EOF >> .env
# Frontend
NEXTAUTH_URL="$(printf "Write your host: " 1>&2; read host; echo $host)"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

EOF

printf "\n"

cat << EOF >> .env
# Requests Encoding
JWT_SECRET="$(openssl rand -base64 32)"

EOF

PASSWORD="$(openssl rand -base64 32)"

cat << EOF >> .env
# Postgres
POSTGRES_HOST="postgres"
POSTGRES_DB="ft_transcendence"
POSTGRES_USER="$(printf "Write your postgres username: " 1>&2; read api; echo $api)"
POSTGRES_PASSWORD="$PASSWORD"
EOF

printf "Your postgres password: $PASSWORD\n\n"
