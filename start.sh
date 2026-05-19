#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Starting Jewel Lifestyle Magazine..."
echo ""
echo "Starting backend (port 5000)..."
cd "$DIR/server" && nohup node index.js > /tmp/jewel-server.log 2>&1 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"
sleep 4
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
  echo "  Backend: OK"
else
  echo "  Backend: FAILED - check /tmp/jewel-server.log"
fi
echo ""
echo "Starting frontend (port 5173)..."
cd "$DIR" && nohup npx vite --host > /tmp/jewel-vite.log 2>&1 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 > /dev/null 2>&1; then
  echo "  Frontend: OK"
else
  echo "  Frontend: FAILED - check /tmp/jewel-vite.log"
fi
echo ""
echo "=== Jewel Lifestyle Magazine is running ==="
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
echo "  Admin:    http://localhost:5173/Login"
echo "  Login:    admin@jewellmagazine.com / admin123"
echo ""
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
