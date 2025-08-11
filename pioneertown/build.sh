#!/bin/bash

# Build script for pioneertown with cache busting options
# Usage: ./build.sh [--no-cache|--cache-bust|--clean]

set -e

IMAGE_NAME="pioneertown"
VERSION=$(date +%Y%m%d-%H%M%S)
BUILDTIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
CACHEBUST=$(date +%s)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse command line arguments
NO_CACHE=""
CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-cache)
            NO_CACHE="--no-cache"
            print_warning "Building with --no-cache flag"
            shift
            ;;
        --cache-bust)
            CACHEBUST=$RANDOM
            print_warning "Using random cache bust: $CACHEBUST"
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --no-cache     Build without using cache"
            echo "  --cache-bust   Use random cache bust value"
            echo "  --clean        Remove existing containers and images first"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Clean up if requested
if [ "$CLEAN" = true ]; then
    print_status "Cleaning up existing containers and images..."
    
    # Stop and remove containers
    if [ "$(docker ps -q -f name=pioneertown)" ]; then
        print_status "Stopping running containers..."
        docker stop $(docker ps -q -f name=pioneertown)
    fi
    
    if [ "$(docker ps -aq -f name=pioneertown)" ]; then
        print_status "Removing containers..."
        docker rm $(docker ps -aq -f name=pioneertown)
    fi
    
    # Remove images
    if [ "$(docker images -q $IMAGE_NAME)" ]; then
        print_status "Removing images..."
        docker rmi $(docker images -q $IMAGE_NAME) 2>/dev/null || true
    fi
    
    print_success "Cleanup completed"
fi

# Build the image
print_status "Building $IMAGE_NAME:$VERSION..."
print_status "Build arguments:"
echo "  - VERSION: $VERSION"
echo "  - BUILDTIME: $BUILDTIME" 
echo "  - CACHEBUST: $CACHEBUST"

if [ -n "$NO_CACHE" ]; then
    print_warning "Building without cache..."
fi

docker build $NO_CACHE \
    --build-arg VERSION="$VERSION" \
    --build-arg BUILDTIME="$BUILDTIME" \
    --build-arg CACHEBUST="$CACHEBUST" \
    -t "$IMAGE_NAME:$VERSION" \
    -t "$IMAGE_NAME:latest" \
    .

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
    print_status "Tagged as: $IMAGE_NAME:$VERSION and $IMAGE_NAME:latest"
    
    echo ""
    print_status "To run the container:"
    echo "  docker run -d -p 8080:8080 --name pioneertown-app $IMAGE_NAME:latest"
    
    echo ""
    print_status "To run with cache busting in future builds:"
    echo "  ./build.sh --cache-bust"
    echo "  ./build.sh --no-cache"
else
    print_error "Build failed!"
    exit 1
fi
