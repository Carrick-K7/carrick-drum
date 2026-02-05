#!/bin/bash
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then
  echo "[$(date)] Service down, restarting..." >> /tmp/drum-health.log
  pm2 restart drum-app
fi
