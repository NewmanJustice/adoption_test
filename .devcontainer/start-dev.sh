#use for local development environment setup only!!!!!!!!

#!/usr/bin/env bash
set -e

echo "Starting development environment..."

# Start PostgreSQL service
echo "Starting PostgreSQL..."
sudo service postgresql start

# Wait for PostgreSQL to be ready
until sudo su - postgres -c "pg_isready" > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL to start..."
  sleep 1
done
echo "✅ PostgreSQL is running"

# Create database user and database if they don't exist
echo "Setting up database..."
sudo su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='adoption'\" | grep -q 1" || \
  sudo su - postgres -c "psql -c \"CREATE USER adoption WITH PASSWORD 'adoption';\""

sudo su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='adoption'\" | grep -q 1" || \
  sudo su - postgres -c "psql -c \"CREATE DATABASE adoption OWNER adoption;\""

sudo su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE adoption TO adoption;\"" 2>/dev/null || true
echo "✅ Database configured"

# Create .env file from example if it doesn't exist
if [ ! -f /workspaces/adoption_test/server/.env ]; then
  echo "Creating server/.env from example..."
  cp /workspaces/adoption_test/server/.env.example /workspaces/adoption_test/server/.env
  echo "✅ Created server/.env"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d /workspaces/adoption_test/node_modules ]; then
  echo "Installing dependencies..."
  cd /workspaces/adoption_test && npm install
  echo "✅ Dependencies installed"
fi

# Run database migrations
echo "Running database migrations..."
cd /workspaces/adoption_test && npm run migrate:up --workspace=server
echo "✅ Migrations complete"

# Start development servers
echo "Starting development servers..."
echo "  Client: http://localhost:3000"
echo "  Server: http://localhost:3001"
cd /workspaces/adoption_test && npm run dev
