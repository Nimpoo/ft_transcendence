FROM python:latest

WORKDIR /app
COPY . .

RUN apt update && apt -y install ncat
RUN python -m pip install --no-cache-dir -r requirements.txt

ENTRYPOINT [ "sh", "entrypoint.sh" ]
