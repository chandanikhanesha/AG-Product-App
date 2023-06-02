PROJECT_NAME := agri_dealer

server:
	cd server && \
		NODE_ENV=local \
		JWT_SECRET=super_secret_string \
		URL_BASE=http://147.182.204.252:3000 \
		node src/server.js

frontend:
	cd client && yarn start

up:
	docker-compose -p $(PROJECT_NAME) up --build -d --force-recreate

down:
	docker-compose -p $(PROJECT_NAME) rm -sfv

simple-up:
	docker-compose -p $(PROJECT_NAME) -f docker-compose.simple.yml up --build -d --force-recreate

simple-down:
	docker-compose -p $(PROJECT_NAME) -f docker-compose.simple.yml rm -sfv

sh-server sh-frontend:
	docker-compose -p $(PROJECT_NAME) exec $(subst sh-,,$@) bash

log-postgres log-migrations log-server log-frontend:
	docker-compose -p $(PROJECT_NAME) logs -f $(subst log-,,$@)

.PHONY: $(MAKECMDGOALS)
