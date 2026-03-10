#!/bin/bash

# MediTrace Project Initialization Script

echo "Starting MediTrace System Setup..."

# 1. Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi
echo "✔ Docker is running"

# 2. Check/Create folder structure (already done by previous steps, but ensuring existence)
if [ ! -d "web" ] || [ ! -d "ml-service" ]; then
    echo "Error: Project structure is missing. Please ensure 'web' and 'ml-service' directories exist."
    exit 1
fi
echo "✔ Directory structure verified"

# 3. Generate Seed Data
echo "Generating initial seed data..."
if [ -f "ml-service/generate_seed.py" ]; then
    # Try running with python3 from host if available, else warn or imply container usage
    if command -v python3 &> /dev/null; then
        # Check if pandas is installed? Probably overkill.
        # Let's try to run it. If it fails due to missing deps, we'll suggest docker.
        echo "Attempting to run seed generation on host..."
        cd ml-service
        if python3 generate_seed.py; then
            echo "✔ Seed data generated (on host)"
        else
            echo "⚠ Could not run seed script on host (missing dependencies?)."
            echo "  The seed data will be generated when you run the ML container locally if you add it to the startup, or you can run:"
            echo "  docker compose run ml-api python generate_seed.py"
        fi
        cd ..
    else
        echo "⚠ Python3 not found on host. Seed data generation skipped."
        echo "  Run 'docker compose run ml-api python generate_seed.py' after starting services."
    fi
else
    echo "Error: ml-service/generate_seed.py not found!"
fi

# 4. Final Message
echo "----------------------------------------------------"
echo "System Ready. Run 'docker compose up' to launch MediTrace."
echo "----------------------------------------------------"
