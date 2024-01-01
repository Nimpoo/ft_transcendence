FROM python:latest

WORKDIR /app

COPY . .

RUN apt-get update && apt-get -y install ncat
RUN python -m pip install --no-cache-dir --requirement requirements.txt

ENTRYPOINT [ "sh", "entrypoint.sh" ]
