#!/bin/bash

echo "🎬 STARTING STREAMFLIX ON LOCALHOST..."

# Check Node.js version
echo "📋 Checking Node.js..."
node --version

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# Start the server
echo "🚀 Starting StreamFlix server..."
echo "✅ Open http://localhost:3000 in your browser"
npm run server