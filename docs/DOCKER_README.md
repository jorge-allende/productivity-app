# Docker Development Environment

This project includes a comprehensive Docker setup that mirrors production configurations while providing development conveniences.

## Quick Start

1. **Prerequisites**
   - Docker Desktop installed and running
   - `.env.local` file configured (copy from `.env.example`)

2. **Start Development Environment**
   ```bash
   # Using Make (recommended)
   make dev

   # Or using docker-compose directly
   docker-compose up -d
   ```

3. **Access the Application**
   - Development: http://localhost:3000
   - Production Preview: http://localhost:8080 (run `make prod`)

## Architecture

### Multi-Stage Dockerfile

The Dockerfile uses a multi-stage build approach:

1. **dependencies**: Installs npm packages
2. **development**: Development server with hot-reloading
3. **builder**: Builds production assets
4. **production**: Nginx server for production deployment

### Services

- **frontend**: React development server with hot-reloading
- **convex-dev**: Runs Convex CLI for backend development
- **nginx-preview**: Production build preview (optional)

## Development Workflow

### Common Commands

```bash
# Start development environment
make dev

# View logs
make logs
make logs-frontend  # Frontend only
make logs-convex    # Convex only

# Run tests
make test
make test-ci       # CI mode with coverage

# Run linting and type checking
make lint
make typecheck

# Access container shell
make shell         # Frontend container
make shell-convex  # Convex container

# Stop services
make stop          # Stop containers
make down          # Stop and remove containers
make clean         # Stop, remove containers and volumes
```

### Hot Reloading

The development setup includes hot-reloading for:
- React components (src/)
- Styles (TailwindCSS)
- Convex functions
- Public assets

### Environment Variables

Environment variables are loaded from `.env.local`:
- `REACT_APP_CONVEX_URL`: Convex deployment URL
- `REACT_APP_AUTH0_*`: Auth0 configuration

## Production Build

### Building for Production

```bash
# Build production image
docker build --target production -t productivity-app:latest .

# Or use docker-compose
make prod-build
```

### Production Features

- Nginx with security headers
- Gzip compression
- Static asset caching
- Health checks
- Non-root user execution
- Runtime environment variable injection

### Production Preview

Test the production build locally:

```bash
# Start production preview
make prod

# Access at http://localhost:8080
```

## Advanced Usage

### Custom Docker Compose Files

- `docker-compose.yml`: Base configuration
- `docker-compose.override.yml`: Local development overrides
- `docker-compose.production.yml`: Production-like environment

### Monitoring Stack

Enable Prometheus and Grafana monitoring:

```bash
make monitoring
```

Access:
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090

### Resource Limits

Production containers include resource limits:
- CPU: 1 core (0.5 reserved)
- Memory: 512MB (256MB reserved)

## Troubleshooting

### Container won't start

1. Check logs: `make logs`
2. Verify .env.local exists
3. Ensure ports 3000/8080 are free

### Hot reload not working

1. Check volume mounts in docker-compose.yml
2. Verify `CHOKIDAR_USEPOLLING=true` is set
3. Restart containers: `make restart`

### Build failures

1. Clear Docker cache: `docker system prune -af`
2. Rebuild without cache: `docker-compose build --no-cache`
3. Check node_modules volume: `make clean && make dev-build`

### Permission issues

- Containers run as non-root user (UID 1001)
- Ensure local files have appropriate permissions
- Use `make shell` to debug inside container

## CI/CD Integration

The Docker setup is designed for easy CI/CD integration:

```yaml
# Example GitHub Actions
- name: Build production image
  run: docker build --target production -t myapp:${{ github.sha }} .

- name: Run tests
  run: docker run --rm myapp:test npm run test:ci
```

## Security Considerations

- Non-root user execution
- Minimal base images (Alpine)
- Security headers in Nginx
- No secrets in images
- Health check endpoints
- CSP headers configured

## Performance Optimization

- Multi-stage builds reduce image size
- Layer caching for faster builds
- Delegated volume mounts on macOS
- Production assets are pre-compressed
- Efficient Nginx caching rules