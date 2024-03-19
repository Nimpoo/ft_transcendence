FROM python:3.12

ARG JWT_SECRET

ARG POSTGRES_HOST
ARG POSTGRES_DB
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD

EXPOSE 8000

WORKDIR /app
COPY . .

RUN apt update && apt -y install ncat
RUN python -m pip install --no-cache-dir -r requirements.txt

ENTRYPOINT [ "sh", "entrypoint.sh" ]
