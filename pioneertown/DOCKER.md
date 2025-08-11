# Docker Deployment Guide for Pioneertown

This guide explains how to build and deploy the Pioneertown MIDI controller application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop the container
docker-compose down
```

### Option 2: Using Docker Commands

```bash
# Build the image
docker build -t pioneertown .

# Run the container
docker run -d -p 8080:8080 --name pioneertown-app pioneertown

# Stop the container
docker stop pioneertown-app

# Remove the container
docker rm pioneertown-app
```

## Access the Application

Once the container is running, you can access the application at:
- **Local**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

## Container Details

### Architecture
- **Multi-stage build**: Uses Node.js Alpine for building, Nginx Alpine for serving
- **Port**: Exposes port 8080
- **Base Images**: 
  - Builder: `node:20-alpine`
  - Production: `nginx:alpine`

### Features
- **Optimized for production**: Static file serving with Nginx
- **Health checks**: Built-in health monitoring
- **Security headers**: CSP, XSS protection, etc.
- **Gzip compression**: Enabled for better performance
- **SPA routing**: Handles client-side routing for React apps
- **Asset caching**: Optimized caching strategy for static assets

### Environment Variables
- `NODE_ENV`: Set to `production` by default

## Development vs Production

### Development
For development, continue using:
```bash
npm run dev
```

### Production Container
The Docker container is optimized for production deployment with:
- Built static assets served by Nginx
- Production-optimized configurations
- Health monitoring
- Security headers

## Customization

### Nginx Configuration
Modify `nginx.conf` to customize:
- Security headers
- Caching policies
- Routing rules
- Performance settings

### Docker Configuration
Modify `Dockerfile` to customize:
- Node.js version
- Build process
- Nginx configuration
- Exposed ports

## Troubleshooting

### Container Health
Check container health:
```bash
docker ps
curl http://localhost:8080/health
```

### Logs
View container logs:
```bash
# Docker Compose
docker-compose logs -f

# Docker
docker logs pioneertown-app
```

### Rebuild
Force rebuild without cache:
```bash
# Docker Compose
docker-compose build --no-cache

# Docker
docker build --no-cache -t pioneertown .
```

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use proper environment configuration
2. **SSL/TLS**: Add HTTPS termination (reverse proxy or load balancer)
3. **Monitoring**: Implement proper logging and monitoring
4. **Scaling**: Use container orchestration (Kubernetes, Docker Swarm)
5. **Secrets Management**: Use proper secrets management for sensitive data

## File Structure

```
.
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf             # Nginx configuration for production
├── .dockerignore          # Files to exclude from Docker build
└── DOCKER.md             # This documentation
```
