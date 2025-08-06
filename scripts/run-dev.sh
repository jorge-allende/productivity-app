#!/bin/bash

# Start Convex in the background
echo "Starting Convex dev server..."
npx convex dev &
CONVEX_PID=$!

# Wait a bit for Convex to start
sleep 3

# Start React dev server
echo "Starting React dev server..."
npm start

# When React server stops, also stop Convex
kill $CONVEX_PID