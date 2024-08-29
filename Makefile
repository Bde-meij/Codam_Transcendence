NAME = v1

all: up

re: clean build up

build: 
	docker compose build
	docker compose up

up: 
	docker compose up

down: 
	docker compose down

frontend:
	docker compose build ./frontend

api:
	docker compose build ./api
	
clean:
	@if [ -n "$$(docker ps -a -q)" ]; then \
		docker stop $$(docker ps -a -q); \
	fi
	@if [ -n "$$(docker volume ls -qf dangling=true)" ]; then \
		docker volume rm $$(docker volume ls -qf dangling=true); \
	fi
	@if [ -n "$$(docker images -q --filter "dangling=true")" ]; then \
		docker rmi $$(docker images -q --filter "dangling=true"); \
	fi
	docker compose down -v --rmi all --remove-orphans
	docker system prune -af