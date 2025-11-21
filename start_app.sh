#!/bin/bash

echo "=========================================="
echo "  Starting Hamburger Review App..."
echo "=========================================="
echo ""
echo "Access the app at: http://localhost:8000"
echo "Or from other devices: http://<YOUR_IP>:8000"
echo ""
echo "To stop the server, press Ctrl+C."
echo ""

cd backend

# Try to open browser (works on desktop environments)
if which xdg-open > /dev/null; then
  xdg-open "http://localhost:8000" &
elif which open > /dev/null; then
  open "http://localhost:8000" &
fi

# Start the server
pipenv run uvicorn main:app --host 0.0.0.0 --port 8000
