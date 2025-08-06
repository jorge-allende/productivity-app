#!/bin/sh

# Health check script for React development server

# Check if the server is responding
if wget --quiet --tries=1 --spider http://localhost:3000; then
    exit 0
else
    exit 1
fi