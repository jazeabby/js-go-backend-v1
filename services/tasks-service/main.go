package main

import (
	"fmt"
	"time"
	"math/rand"
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

func handler(msg *kafka.Message) {
	fmt.Printf("Handler: Message on %s: %s\n", msg.TopicPartition, string(msg.Value))

	switch e := msg.TopicPartition {
	case "task.created":
		go runTask(msg);
	}
}

// TaskPayload represents the structure of the JSON payload.
type TaskPayload struct {
	Message string `json:"message"`
}

func runTask(msg *kafka.Message) {
	
	var payload TaskPayload
	err := json.Unmarshal(m.Value, &payload)
	if err != nil {
		fmt.Printf("Failed to decode JSON: %v\n", err)
		return
	}

	producer, err := CreateProducers(bootstrapServers)
	if err != nil {
		fmt.Printf("Error creating producer: %v\n", err)
		os.Exit(1)
	}

	defer producer.Close()

	// task updated to running
	value := {
		"id": payload.Message.id,
		"status": "RUNNING"
	}
	_, err := SendJSON(producer, "task.updated", value)
	
	if err != nil {
		fmt.Printf("Error producing message: %v\n", err)
	}

	// Wait for a short time to allow the goroutine to execute
	// Seed the random number generator
    rand.Seed(time.Now().UnixNano())

    // Generate a random duration between 0 and 5 seconds
    randomDuration := time.Duration(rand.Intn(5)) * time.Second

    fmt.Printf("Random duration: %s\n", randomDuration)
	
	// sleep with random duration
	time.Sleep(100 * randomDuration)

	// Define the two values
	values := []string{"success", "failure"}

	// Generate a random index
	randomIndex := rand.Intn(len(values))
	// Choose the value at the random index
	randomValue := values[randomIndex]
	fmt.Println("Randomly chosen value:", randomValue)

	// task updated to running
	value := {
		"id": payload.Message.id,
		"status": randomValue
	}
	_, err := SendJson(producer, "task.updated", value)
	
	if err != nil {
		fmt.Printf("Error producing message: %v\n", err)
	}
}

func main() {
	Consume([]string{"users.created", "task.created"}, handler)
}
