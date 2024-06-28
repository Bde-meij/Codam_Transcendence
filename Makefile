NAME = v1

all: down build up

re: data clean all

build: 
	docker compose build

images: docker images

up: 
	docker compose up

down: 
	docker compose down

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