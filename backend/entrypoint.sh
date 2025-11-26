#!/bin/sh
set -e

echo "Waiting for Postgres..."
./wait-for-it.sh db:5432 --timeout=30 --strict -- echo "Postgres is up"

echo "Waiting for Redis..."
./wait-for-it.sh redis:6379 --timeout=30 --strict -- echo "Redis is up"

# Apply migrations only if running Django server
if [ "$1" = "gunicorn" ] || [ "$1" = "python" ]; then
    echo "Making migrations..."
    python manage.py makemigrations || echo "No changes to migrations"

    echo "Applying migrations..."
    python manage.py migrate
fi

# Execute the main command
exec "$@"
