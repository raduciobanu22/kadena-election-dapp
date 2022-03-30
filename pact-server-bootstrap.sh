set -m

# Start pact server in background
pact -s config.yaml & 2>/dev/null

# Get background job number
jnum=$(jobs -l | grep " $! " | sed 's/\[\(.*\)\].*/\1/')

sleep 2

echo 'Loading fungible-v2...'
CONTRACT_PATH=pact/root/fungible-v2.pact node scripts/pact-server/deploy.js

echo 'Loading coin-v3...'
CONTRACT_PATH=pact/root/coin-v3.pact node scripts/pact-server/deploy.js

# Bring pact server to foreground
fg $jnum > /dev/null
