# Productivity App Docker Makefile

# Variables
DOCKER_COMPOSE = docker-compose -f docker/docker-compose.yml
DOCKER_COMPOSE_PROD = docker-compose -f docker/docker-compose.yml -f docker/docker-compose.production.yml
APP_NAME = productivity-app

# Default environment file
ENV_FILE ?= .env.local

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: check-env
check-env: ## Check if required environment variables are set
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "Error: $(ENV_FILE) not found. Copy .env.example to $(ENV_FILE) and configure it."; \
		exit 1; \
	fi

.PHONY: dev
dev: check-env ## Start development environment
	$(DOCKER_COMPOSE) up -d
	@echo "Development server running at http://localhost:3000"
	@echo "Run 'make logs' to see container logs"

.PHONY: dev-build
dev-build: check-env ## Build and start development environment
	$(DOCKER_COMPOSE) up -d --build
	@echo "Development server running at http://localhost:3000"

.PHONY: prod
prod: check-env ## Start production-like environment
	$(DOCKER_COMPOSE_PROD) --profile production up -d
	@echo "Production preview running at http://localhost:8080"

.PHONY: prod-build
prod-build: check-env ## Build and start production-like environment
	$(DOCKER_COMPOSE_PROD) --profile production up -d --build

.PHONY: stop
stop: ## Stop all containers
	$(DOCKER_COMPOSE) stop

.PHONY: down
down: ## Stop and remove all containers
	$(DOCKER_COMPOSE) down

.PHONY: clean
clean: ## Stop containers and remove volumes
	$(DOCKER_COMPOSE) down -v

.PHONY: logs
logs: ## Show container logs
	$(DOCKER_COMPOSE) logs -f

.PHONY: logs-frontend
logs-frontend: ## Show frontend container logs
	$(DOCKER_COMPOSE) logs -f frontend

.PHONY: logs-convex
logs-convex: ## Show Convex container logs
	$(DOCKER_COMPOSE) logs -f convex-dev

.PHONY: shell
shell: ## Open shell in frontend container
	$(DOCKER_COMPOSE) exec frontend sh

.PHONY: shell-convex
shell-convex: ## Open shell in Convex container
	$(DOCKER_COMPOSE) exec convex-dev sh

.PHONY: test
test: ## Run tests in container
	$(DOCKER_COMPOSE) exec frontend npm test

.PHONY: test-ci
test-ci: ## Run CI tests in container
	$(DOCKER_COMPOSE) exec frontend npm run test:ci

.PHONY: lint
lint: ## Run linter in container
	$(DOCKER_COMPOSE) exec frontend npm run lint

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	$(DOCKER_COMPOSE) exec frontend npm run typecheck

.PHONY: build
build: ## Build production bundle in container
	$(DOCKER_COMPOSE) exec frontend npm run build

.PHONY: restart
restart: ## Restart all containers
	$(DOCKER_COMPOSE) restart

.PHONY: restart-frontend
restart-frontend: ## Restart frontend container
	$(DOCKER_COMPOSE) restart frontend

.PHONY: ps
ps: ## Show container status
	$(DOCKER_COMPOSE) ps

.PHONY: pull
pull: ## Pull latest base images
	$(DOCKER_COMPOSE) pull

.PHONY: monitoring
monitoring: check-env ## Start with monitoring stack (Prometheus + Grafana)
	$(DOCKER_COMPOSE_PROD) --profile production --profile monitoring up -d
	@echo "Grafana running at http://localhost:3001 (admin/admin)"
	@echo "Prometheus running at http://localhost:9090"

.PHONY: validate
validate: ## Run full validation suite in container
	$(DOCKER_COMPOSE) exec frontend npm run validate

.PHONY: prune
prune: ## Remove all unused Docker resources
	docker system prune -af --volumes