package main

import (
	"context"
	"log"
	"time"

	"playground/pb"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// 连接到服务器
	serverAddr := "localhost:50051"
	conn, err := grpc.Dial(serverAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("连接服务器失败: %v", err)
	}
	defer conn.Close()

	// 创建客户端
	client := pb.NewSliceServiceClient(conn)

	// 创建上下文，设置超时时间
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 测试 ProcessNumbers - 发送数字切片
	log.Println("========== 测试 ProcessNumbers ==========")
	numbers := []int32{1, 2, 3, 4, 5, 10, 20, 30}
	log.Printf("发送数字切片: %v", numbers)

	numbersResp, err := client.ProcessNumbers(ctx, &pb.NumbersRequest{
		Numbers: numbers,
	})
	if err != nil {
		log.Fatalf("调用 ProcessNumbers 失败: %v", err)
	}

	log.Printf("收到响应:")
	log.Printf("  处理后的数字: %v", numbersResp.GetProcessedNumbers())
	log.Printf("  消息: %s", numbersResp.GetMessage())

	// 测试 ProcessStrings - 发送字符串切片
	log.Println("\n========== 测试 ProcessStrings ==========")
	strings := []string{"hello", "world", "grpc", "golang", "切片测试"}
	log.Printf("发送字符串切片: %v", strings)

	stringsResp, err := client.ProcessStrings(ctx, &pb.StringsRequest{
		Strings: strings,
	})
	if err != nil {
		log.Fatalf("调用 ProcessStrings 失败: %v", err)
	}

	log.Printf("收到响应:")
	log.Printf("  处理后的字符串: %v", stringsResp.GetProcessedStrings())
	log.Printf("  消息: %s", stringsResp.GetMessage())

	log.Println("\n========== 所有测试完成 ==========")
}
