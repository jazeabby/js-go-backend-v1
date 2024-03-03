package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

func handler(msg *kafka.Message) {
	fmt.Printf("Handler: Message on %s: %s\n", *msg.TopicPartition.Topic, string(msg.Value))

	go runTask(msg)
}

// TaskPayload represents the structure of the JSON payload.
type TaskPayload struct {
	Message TaskPayloadToSend `json:"message"`
}
type TaskPayloadToSend struct {
	Id     string `json:"id"`
	Status string `json:"status"`
}

func runTask(msg *kafka.Message) {

	fmt.Printf("Inside Run Task\n")

	producer, err := CreateProducers(os.Getenv("KAFKA_URI"))
	if err != nil {
		fmt.Printf("Error creating producer: %v\n", err)
		os.Exit(1)
	}

	defer producer.Close()

	var payload TaskPayloadToSend
	err = json.NewDecoder(strings.NewReader(string(msg.Value))).Decode(&payload)

	if err != nil {
		fmt.Printf("Failed to decode JSON: %v\n", err)
		return
	}

	// task updated to running
	taskPayloadToSend := TaskPayloadToSend{
		Id:     payload.Id,
		Status: "RUNNING",
	}
	fmt.Println("Task Payload: ", taskPayloadToSend)

	err = SendJson(producer, "task.updated", taskPayloadToSend)

	if err != nil {
		fmt.Printf("Error producing message: %v\n", err)
	}

	// Wait for a short time to allow the goroutine to execute
	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)

	// Generate a random duration between 0 and 5 seconds
	randomDuration := time.Duration(rng.Intn(5)) * time.Second

	fmt.Printf("Random duration: %s\n", randomDuration)

	// sleep with random duration
	time.Sleep(100 * randomDuration)

	// Define the two values
	values := []string{"SUCCESS", "FAILURE"}

	// Generate a random index
	randomIndex := rng.Intn(len(values))
	randomStatus := values[randomIndex]
	fmt.Println("Randomly chosen value:", randomStatus)

	// task updated to running
	taskPayloadToSend.Status = randomStatus

	fmt.Println("JSON Payload:", taskPayloadToSend)
	err = SendJson(producer, "task.updated", taskPayloadToSend)

	if err != nil {
		fmt.Printf("Error producing message: %v\n", err)
	}
	fmt.Println("Payload Sent")
}

func main() {
	forever := make(chan bool)
	Consume([]string{"users.created", "task.created"}, handler)
	<-forever
}
