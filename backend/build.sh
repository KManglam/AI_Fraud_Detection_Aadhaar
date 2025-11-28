#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=== Starting Render Build Process ==="

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "Creating directories..."
mkdir -p media/raw media/processed media/thumbnails
mkdir -p staticfiles

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Run database migrations
echo "Running migrations..."
python manage.py migrate --no-input

# Create superuser from environment variables (if set)
echo "Checking superuser..."
python manage.py create_superuser_if_not_exists

echo "=== Build Complete ==="
