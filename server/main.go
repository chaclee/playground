package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"strings"

	"playground/pb"

	"google.golang.org/grpc"
)

// server 是 SliceService 的实现
type server struct {
	pb.UnimplementedSliceServiceServer
}

// ProcessNumbers 处理数字切片：将每个数字乘以2
func (s *server) ProcessNumbers(ctx context.Context, req *pb.NumbersRequest) (*pb.NumbersResponse, error) {
	log.Printf("收到数字切片请求: %v", req.GetNumbers())

	// 处理切片：将每个数字乘以2
	processedNumbers := make([]int32, len(req.GetNumbers()))
	for i, num := range req.GetNumbers() {
		processedNumbers[i] = num * 2
	}

	log.Printf("处理后的数字切片: %v", processedNumbers)

	return &pb.NumbersResponse{
		ProcessedNumbers: processedNumbers,
		Message:          fmt.Sprintf("成功处理了 %d 个数字，每个数字都乘以2", len(processedNumbers)),
	}, nil
}

// ProcessStrings 处理字符串切片：将每个字符串转换为大写并添加前缀
func (s *server) ProcessStrings(ctx context.Context, req *pb.StringsRequest) (*pb.StringsResponse, error) {
	log.Printf("收到字符串切片请求: %v", req.GetStrings())

	// 处理切片：转换为大写并添加前缀
	processedStrings := make([]string, len(req.GetStrings()))
	for i, str := range req.GetStrings() {
		processedStrings[i] = "处理后-" + strings.ToUpper(str)
	}

	log.Printf("处理后的字符串切片: %v", processedStrings)

	return &pb.StringsResponse{
		ProcessedStrings: processedStrings,
		Message:          fmt.Sprintf("成功处理了 %d 个字符串，都已转换为大写并添加了前缀", len(processedStrings)),
	}, nil
}

func main() {
	// 监听 TCP 端口
	port := ":50051"
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("监听端口失败: %v", err)
	}

	// 创建 gRPC 服务器
	s := grpc.NewServer()

	// 注册服务
	pb.RegisterSliceServiceServer(s, &server{})

	log.Printf("gRPC 服务器启动，监听端口 %s", port)

	// 启动服务器
	if err := s.Serve(lis); err != nil {
		log.Fatalf("启动服务器失败: %v", err)
	}
}
