DOCKER_VOLUME_DIRS=postgres-data backend/media nginx/certificates

up: $(DOCKER_VOLUME_DIRS) .env nginx/certificates/ft_transcendence.crt
	docker compose up --build

detach: $(DOCKER_VOLUME_DIRS) .env nginx/certificates/ft_transcendence.crt
	docker compose up --build --detach

down:
	docker compose down

logs:
	docker compose logs -f

.env:
	./generate-env.sh

nginx/certificates/ft_transcendence.crt: nginx/certificates
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/certificates/ft_transcendence.key -out nginx/certificates/ft_transcendence.crt -subj "/C=FR/ST=PACA/L=NICE/O=42Nice/CN=ft_transcendence.local"

$(DOCKER_VOLUME_DIRS):
	@mkdir -pv $@

reset: down
	rm -rf $(DOCKER_VOLUME_DIRS) 

.PHONY: up detach down logs reset
