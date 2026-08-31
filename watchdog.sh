#!/bin/bash
# Dream Matches site watchdog: if the public site stops responding, restart servers.
SITE=https://23cab27773db6ecaba40ee3ec09d2285.ctonew.app/
code=$(curl -s --max-time 8 -o /dev/null -w "%{http_code}" "$SITE" 2>/dev/null)
if [ "$code" != "200" ]; then
  cd /home/team/shared/dream-matches-web || exit 1
  fuser -k 3000/tcp 3001/tcp 2>/dev/null
  sleep 2
  nohup npx next start -p 3001 > /tmp/next.log 2>&1 &
  nohup bun run bun-proxy.ts > /tmp/proxy.log 2>&1 &
  echo "$(date) watchdog restarted servers (got $code)" >> /tmp/watchdog.log
fi
