# /bin/bash

echo "Usage: ./scripts/create-task.sh <jwt>"
echo "Getting tasks from $1"

curl -X GET -H 'Accept: application/json' -H 'Content-Type:application/json' -H "Authorization: Bearer $1" localhost:2602/tasks