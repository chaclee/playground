# Go gRPC 切片服务示例

这是一个简单的 Go gRPC 服务示例，演示了如何传递和返回切片（slice）。

## 项目结构

```
.
├── proto/                  # proto 定义文件
│   └── slice_service.proto
├── pb/                     # 生成的 protobuf 代码
│   ├── slice_service.pb.go
│   └── slice_service_grpc.pb.go
├── server/                 # 服务端代码
│   └── main.go
├── client/                 # 客户端代码
│   └── main.go
├── go.mod                  # Go 模块定义
├── Makefile               # 编译和运行脚本
└── README.md              # 说明文档
```

## 功能说明

服务提供两个 RPC 方法：

1. **ProcessNumbers**: 接收一个 int32 数字切片，将每个数字乘以2后返回
2. **ProcessStrings**: 接收一个字符串切片，将每个字符串转换为大写并添加前缀后返回

## 快速开始

### 1. 编译项目

```bash
# 编译服务端
go build -o bin/server ./server

# 编译客户端
go build -o bin/client ./client
```

或者使用 Makefile：

```bash
make build
```

### 2. 运行服务端

在一个终端窗口中运行：

```bash
./bin/server
```

或者：

```bash
make run-server
```

服务端将在 `localhost:50051` 上监听。

### 3. 运行客户端

在另一个终端窗口中运行：

```bash
./bin/client
```

或者：

```bash
make run-client
```

客户端会发送示例数据并打印服务端的响应。

## 示例输出

### 服务端输出：

```
gRPC 服务器启动，监听端口 :50051
收到数字切片请求: [1 2 3 4 5 10 20 30]
处理后的数字切片: [2 4 6 8 10 20 40 60]
收到字符串切片请求: [hello world grpc golang 切片测试]
处理后的字符串切片: [处理后-HELLO 处理后-WORLD 处理后-GRPC 处理后-GOLANG 处理后-切片测试]
```

### 客户端输出：

```
========== 测试 ProcessNumbers ==========
发送数字切片: [1 2 3 4 5 10 20 30]
收到响应:
  处理后的数字: [2 4 6 8 10 20 40 60]
  消息: 成功处理了 8 个数字，每个数字都乘以2

========== 测试 ProcessStrings ==========
发送字符串切片: [hello world grpc golang 切片测试]
收到响应:
  处理后的字符串: [处理后-HELLO 处理后-WORLD 处理后-GRPC 处理后-GOLANG 处理后-切片测试]
  消息: 成功处理了 5 个字符串，都已转换为大写并添加了前缀

========== 所有测试完成 ==========
```

## Proto 定义

查看 `proto/slice_service.proto` 文件了解详细的服务定义。

关键部分：
- 使用 `repeated` 关键字定义切片类型
- `repeated int32` 表示 int32 切片
- `repeated string` 表示字符串切片

## 清理

```bash
make clean
```

## 依赖

- Go 1.21+
- google.golang.org/grpc
- google.golang.org/protobuf
