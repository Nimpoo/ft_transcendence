FROM python:3.12

EXPOSE 8000

WORKDIR /app
COPY . .

RUN apt update && apt -y install ncat
RUN python -m pip install --no-cache-dir -r requirements.txt

ENTRYPOINT [ "sh", "entrypoint.sh" ]
