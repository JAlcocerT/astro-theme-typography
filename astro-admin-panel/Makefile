# Astro Admin Panel - Simple Makefile

.PHONY: help install dev build start lint clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make dev      - Start development server"
	@echo "  make build    - Build for production"
	@echo "  make start    - Start production server"
	@echo "  make lint     - Run linter"
	@echo "  make clean    - Clean node_modules and build files"

# Install dependencies
install:
	npm install --legacy-peer-deps

# Start development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Start production server
start:
	npm start

# Run linter
lint:
	npm run lint

# Clean build artifacts and dependencies
clean:
	rm -rf node_modules
	rm -rf .next
	rm -rf dist
