# /bin/bash

echo "Usage: ./scripts/create-task.sh <jwt> <description>"
echo "Creating user $1 with password $2"

# curl -X POST -H 'Accept: application/json' -H 'Content-Type:application/json' -H "Authorization: Bearer \"$1\"" \ -d "{\"description\": \"$2\"}" localhost:2602/tasks
curl --location 'localhost:2602/tasks' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer '$1 \
--data '{
    "description": "'$2'"
}'