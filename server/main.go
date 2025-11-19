package main

import (
	"context"
	"fmt"
	"log"
	"net"

	"playground/pb"

	"google.golang.org/grpc"
)

// server 是 SliceService 的实现
type server struct {
	pb.UnimplementedSliceServiceServer
}

// ProcessNumbers 处理数字切片：直接返回原样
func (s *server) ProcessNumbers(ctx context.Context, req *pb.NumbersRequest) (*pb.NumbersResponse, error) {
	log.Printf("收到数字切片请求: %v", req.GetNumbers())

	// 直接返回原样
	numbers := req.GetNumbers()

	log.Printf("返回数字切片: %v", numbers)

	return &pb.NumbersResponse{
		ProcessedNumbers: numbers,
		Message:          fmt.Sprintf("成功接收了 %d 个数字", len(numbers)),
	}, nil
}

// ProcessStrings 处理字符串切片：直接返回原样
func (s *server) ProcessStrings(ctx context.Context, req *pb.StringsRequest) (*pb.StringsResponse, error) {
	log.Printf("收到字符串切片请求: %v", req.GetStrings())

	// 直接返回原样
	strings := req.GetStrings()

	log.Printf("返回字符串切片: %v", strings)

	return &pb.StringsResponse{
		ProcessedStrings: strings,
		Message:          fmt.Sprintf("成功接收了 %d 个字符串", len(strings)),
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
