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

	// 测试 EchoNumbers - 发送数字切片
	log.Println("\n========================================")
	log.Println("测试1: 发送空切片 []int32{}")
	log.Println("========================================")
	emptySlice := []int32{}
	log.Printf("客户端 - 空切片是否为 nil: %v", emptySlice == nil)
	log.Printf("客户端 - 空切片长度: %d", len(emptySlice))
	log.Printf("客户端 - 空切片容量: %d", cap(emptySlice))

	numbersResp1, err := client.EchoNumbers(ctx, &pb.NumbersRequest{
		Numbers:      emptySlice,
		NumbersIsNil: false,  // 显式标记这不是 nil
	})
	if err != nil {
		log.Fatalf("调用 EchoNumbers 失败: %v", err)
	}
	log.Printf("\n客户端收到响应:")
	log.Printf("  返回切片: %v", numbersResp1.GetProcessedNumbers())
	log.Printf("  服务端判断 IsNil: %v", numbersResp1.GetIsNil())
	log.Printf("  服务端 SliceLength: %d", numbersResp1.GetSliceLength())
	log.Printf("  服务端 SliceCapacity: %d", numbersResp1.GetSliceCapacity())
	log.Printf("  消息: %s", numbersResp1.GetMessage())
	log.Printf("  客户端收到后是否为 nil: %v\n", numbersResp1.ProcessedNumbers == nil)

	// 测试2: 发送 nil 切片
	log.Println("\n========================================")
	log.Println("测试2: 发送 nil 切片")
	log.Println("========================================")
	var nilSlice []int32
	log.Printf("客户端 - nil切片是否为 nil: %v", nilSlice == nil)
	log.Printf("客户端 - nil切片长度: %d", len(nilSlice))
	log.Printf("客户端 - nil切片容量: %d", cap(nilSlice))

	numbersResp2, err := client.EchoNumbers(ctx, &pb.NumbersRequest{
		Numbers:      nilSlice,
		NumbersIsNil: true,  // 显式标记这是 nil
	})
	if err != nil {
		log.Fatalf("调用 EchoNumbers 失败: %v", err)
	}
	log.Printf("\n客户端收到响应:")
	log.Printf("  返回切片: %v", numbersResp2.GetProcessedNumbers())
	log.Printf("  服务端判断 IsNil: %v", numbersResp2.GetIsNil())
	log.Printf("  服务端 SliceLength: %d", numbersResp2.GetSliceLength())
	log.Printf("  服务端 SliceCapacity: %d", numbersResp2.GetSliceCapacity())
	log.Printf("  消息: %s", numbersResp2.GetMessage())
	log.Printf("  客户端收到后是否为 nil: %v\n", numbersResp2.ProcessedNumbers == nil)

	// 测试3: 发送有数据的切片
	log.Println("\n========================================")
	log.Println("测试3: 发送有数据的切片 [1, 2, 3, 4, 5]")
	log.Println("========================================")
	dataSlice := []int32{1, 2, 3, 4, 5}
	log.Printf("客户端 - 数据切片是否为 nil: %v", dataSlice == nil)
	log.Printf("客户端 - 数据切片: %v", dataSlice)

	numbersResp3, err := client.EchoNumbers(ctx, &pb.NumbersRequest{
		Numbers: dataSlice,
	})
	if err != nil {
		log.Fatalf("调用 EchoNumbers 失败: %v", err)
	}
	log.Printf("\n客户端收到响应:")
	log.Printf("  返回切片: %v", numbersResp3.GetProcessedNumbers())
	log.Printf("  服务端判断 IsNil: %v", numbersResp3.GetIsNil())
	log.Printf("  服务端 SliceLength: %d", numbersResp3.GetSliceLength())
	log.Printf("  服务端 SliceCapacity: %d", numbersResp3.GetSliceCapacity())
	log.Printf("  消息: %s", numbersResp3.GetMessage())
	log.Printf("  客户端收到后是否为 nil: %v\n", numbersResp3.ProcessedNumbers == nil)

	// 测试 EchoStrings - 发送字符串切片
	log.Println("\n========================================")
	log.Println("测试4: 字符串空切片")
	log.Println("========================================")
	emptyStrSlice := []string{}
	log.Printf("客户端 - 空字符串切片是否为 nil: %v", emptyStrSlice == nil)

	stringsResp1, err := client.EchoStrings(ctx, &pb.StringsRequest{
		Strings:      emptyStrSlice,
		StringsIsNil: false,  // 显式标记这不是 nil
	})
	if err != nil {
		log.Fatalf("调用 EchoStrings 失败: %v", err)
	}
	log.Printf("\n客户端收到响应:")
	log.Printf("  返回切片: %v", stringsResp1.GetProcessedStrings())
	log.Printf("  服务端判断 IsNil: %v", stringsResp1.GetIsNil())
	log.Printf("  服务端 SliceLength: %d", stringsResp1.GetSliceLength())
	log.Printf("  服务端 SliceCapacity: %d", stringsResp1.GetSliceCapacity())
	log.Printf("  消息: %s", stringsResp1.GetMessage())
	log.Printf("  客户端收到后是否为 nil: %v\n", stringsResp1.ProcessedStrings == nil)

	// 测试5: 字符串 nil 切片
	log.Println("\n========================================")
	log.Println("测试5: 字符串 nil 切片")
	log.Println("========================================")
	var nilStrSlice []string
	log.Printf("客户端 - nil字符串切片是否为 nil: %v", nilStrSlice == nil)

	stringsResp2, err := client.EchoStrings(ctx, &pb.StringsRequest{
		Strings:      nilStrSlice,
		StringsIsNil: true,  // 显式标记这是 nil
	})
	if err != nil {
		log.Fatalf("调用 EchoStrings 失败: %v", err)
	}
	log.Printf("\n客户端收到响应:")
	log.Printf("  返回切片: %v", stringsResp2.GetProcessedStrings())
	log.Printf("  服务端判断 IsNil: %v", stringsResp2.GetIsNil())
	log.Printf("  服务端 SliceLength: %d", stringsResp2.GetSliceLength())
	log.Printf("  服务端 SliceCapacity: %d", stringsResp2.GetSliceCapacity())
	log.Printf("  消息: %s", stringsResp2.GetMessage())
	log.Printf("  客户端收到后是否为 nil: %v\n", stringsResp2.ProcessedStrings == nil)

	log.Println("\n========== 所有测试完成 ==========")
}
