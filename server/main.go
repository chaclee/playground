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

// EchoNumbers Echo 数字切片，原样返回并附加切片信息
func (s *server) EchoNumbers(ctx context.Context, req *pb.NumbersRequest) (*pb.NumbersResponse, error) {
	numbers := req.GetNumbers()
	clientSentNil := req.GetNumbersIsNil()
	
	// 验证接收到的切片类型
	log.Printf("========== 服务端接收数字切片分析 ==========")
	log.Printf("收到的切片值: %v", numbers)
	log.Printf("切片是否为 nil: %v", numbers == nil)
	log.Printf("切片长度: %d", len(numbers))
	log.Printf("切片容量: %d", cap(numbers))
	log.Printf("直接访问 req.Numbers == nil: %v", req.Numbers == nil)
	log.Printf("客户端显式标记 NumbersIsNil: %v", clientSentNil)
	
	// 根据客户端标记区分 nil 和空切片
	if clientSentNil {
		log.Printf("✅ 客户端发送的是: nil 切片")
	} else if len(numbers) == 0 {
		log.Printf("✅ 客户端发送的是: 空切片 []int32{}")
	} else {
		log.Printf("✅ 客户端发送的是: 有数据的切片")
	}
	log.Printf("==========================================\n")

	return &pb.NumbersResponse{
		ProcessedNumbers: numbers,  // 直接返回原始切片
		Message:          fmt.Sprintf("Echo: 接收到 %d 个数字 (client_sent_nil=%v)", len(numbers), clientSentNil),
		IsNil:           numbers == nil,
		SliceLength:     int32(len(numbers)),
		SliceCapacity:   int32(cap(numbers)),
	}, nil
}

// EchoStrings Echo 字符串切片，原样返回并附加切片信息
func (s *server) EchoStrings(ctx context.Context, req *pb.StringsRequest) (*pb.StringsResponse, error) {
	strs := req.GetStrings()
	clientSentNil := req.GetStringsIsNil()
	
	// 验证接收到的切片类型
	log.Printf("========== 服务端接收字符串切片分析 ==========")
	log.Printf("收到的切片值: %v", strs)
	log.Printf("切片是否为 nil: %v", strs == nil)
	log.Printf("切片长度: %d", len(strs))
	log.Printf("切片容量: %d", cap(strs))
	log.Printf("直接访问 req.Strings == nil: %v", req.Strings == nil)
	log.Printf("客户端显式标记 StringsIsNil: %v", clientSentNil)
	
	// 根据客户端标记区分 nil 和空切片
	if clientSentNil {
		log.Printf("✅ 客户端发送的是: nil 切片")
	} else if len(strs) == 0 {
		log.Printf("✅ 客户端发送的是: 空切片 []string{}")
	} else {
		log.Printf("✅ 客户端发送的是: 有数据的切片")
	}
	log.Printf("==============================================\n")

	return &pb.StringsResponse{
		ProcessedStrings: strs,  // 直接返回原始切片
		Message:          fmt.Sprintf("Echo: 接收到 %d 个字符串 (client_sent_nil=%v)", len(strs), clientSentNil),
		IsNil:           strs == nil,
		SliceLength:     int32(len(strs)),
		SliceCapacity:   int32(cap(strs)),
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
