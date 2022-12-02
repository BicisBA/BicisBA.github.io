NAME=bicisba
REPO=react
all:
	docker build . --tag $(REPO)
	docker run --publish 3000:3000 --detach --name $(NAME) $(REPO)

down:
	docker stop $(NAME)
	docker rm $(NAME)
