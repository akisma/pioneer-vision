#!/bin/bash

# Security scan script for Docker container
# This script performs basic security checks on the Docker image

set -e

IMAGE_NAME=${1:-"pioneertown"}
CONTAINER_NAME="security-scan-temp"

echo "🔒 Starting security scan for image: $IMAGE_NAME"
echo "================================================"

# Check if image exists
if ! docker images | grep -q "$IMAGE_NAME"; then
    echo "❌ Error: Image '$IMAGE_NAME' not found. Please build the image first."
    exit 1
fi

echo "📋 Image Information:"
docker images "$IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

echo -e "\n🔍 Security Analysis:"

# 1. Check for non-root user
echo "• Checking if container runs as non-root user..."
USER_CHECK=$(docker run --rm "$IMAGE_NAME" whoami 2>/dev/null || echo "root")
if [ "$USER_CHECK" != "root" ]; then
    echo "  ✅ Container runs as non-root user: $USER_CHECK"
    # Additional check for specific user
    USER_ID=$(docker run --rm "$IMAGE_NAME" id -u 2>/dev/null || echo "0")
    if [ "$USER_ID" = "1001" ]; then
        echo "  ✅ Running as expected nginx-custom user (UID: $USER_ID)"
    else
        echo "  ℹ️  Running as user ID: $USER_ID"
    fi
else
    echo "  ⚠️  Container runs as root user (security risk)"
fi

# 2. Check for common vulnerabilities in packages
echo "• Checking for known vulnerabilities..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    -v /tmp:/tmp aquasec/trivy:latest image "$IMAGE_NAME" \
    --severity HIGH,CRITICAL --quiet || echo "  ⚠️  Trivy not available - install for vulnerability scanning"

# 3. Check image layers and history
echo "• Analyzing image layers..."
LAYER_COUNT=$(docker history "$IMAGE_NAME" --quiet | wc -l)
echo "  📊 Image has $LAYER_COUNT layers"

# 4. Check for sensitive files
echo "• Checking for sensitive files in container..."
TEMP_CONTAINER=$(docker run -d "$IMAGE_NAME" sleep 30)
trap "docker rm -f $TEMP_CONTAINER 2>/dev/null || true" EXIT

# Check for common sensitive file patterns
SENSITIVE_FILES=$(docker exec "$TEMP_CONTAINER" find / -type f \( \
    -name "*.key" -o \
    -name "*.pem" -o \
    -name "*.p12" -o \
    -name "*.pfx" -o \
    -name "*password*" -o \
    -name "*secret*" -o \
    -name ".env*" \
    \) 2>/dev/null | grep -v '/proc/' | grep -v '/sys/' || true)

if [ -z "$SENSITIVE_FILES" ]; then
    echo "  ✅ No obvious sensitive files found"
else
    echo "  ⚠️  Potential sensitive files found:"
    echo "$SENSITIVE_FILES" | sed 's/^/    /'
fi

# 5. Check running processes
echo "• Checking running processes..."
PROCESSES=$(docker exec "$TEMP_CONTAINER" ps aux 2>/dev/null || echo "ps command not available")
if echo "$PROCESSES" | grep -q "nginx"; then
    echo "  ✅ Nginx process detected"
else
    echo "  ⚠️  Expected nginx process not found"
fi

# 6. Check open ports
echo "• Checking exposed ports..."
PORTS=$(docker port "$TEMP_CONTAINER" 2>/dev/null || echo "No ports exposed")
echo "  📡 Exposed ports: $PORTS"

# 7. Health check
echo "• Testing health endpoint..."
CONTAINER_IP=$(docker inspect "$TEMP_CONTAINER" --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
if docker exec "$TEMP_CONTAINER" wget -qO- "http://localhost:8080/health" >/dev/null 2>&1; then
    echo "  ✅ Health endpoint responding"
else
    echo "  ⚠️  Health endpoint not responding"
fi

# Cleanup
docker rm -f "$TEMP_CONTAINER" 2>/dev/null || true

echo -e "\n🛡️  Security Recommendations:"
echo "• Keep base images updated regularly"
echo "• Run 'npm audit' to check for package vulnerabilities"
echo "• Use tools like Trivy or Clair for comprehensive vulnerability scanning"
echo "• Consider using distroless images for even smaller attack surface"
echo "• Implement image signing and verification in CI/CD"
echo "• Regular security scanning in your deployment pipeline"

echo -e "\n✅ Security scan completed!"
