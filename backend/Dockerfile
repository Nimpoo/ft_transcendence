FROM python:latest

EXPOSE 8000

RUN apt update && apt -y install ncat

WORKDIR /app

COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt

VOLUME ./static:static
VOLUME ./media:media

COPY . .

ENTRYPOINT ["sh", "entrypoint.sh"]
