.PHONY: build run-server run-client clean test

# 编译所有
build:
	@echo "编译服务端..."
	@mkdir -p bin
	@go build -o bin/server ./server
	@echo "编译客户端..."
	@go build -o bin/client ./client
	@echo "编译完成！"

# 运行服务端
run-server:
	@echo "启动 gRPC 服务端..."
	@./bin/server

# 运行客户端
run-client:
	@echo "启动 gRPC 客户端..."
	@./bin/client

# 测试（先启动服务端，然后运行客户端）
test:
	@echo "运行测试..."
	@./bin/server & SERVER_PID=$$! && \
	sleep 2 && \
	./bin/client && \
	kill $$SERVER_PID

# 清理编译产物
clean:
	@echo "清理编译产物..."
	@rm -rf bin
	@echo "清理完成！"

# 下载依赖
deps:
	@echo "下载依赖..."
	@go mod download
	@echo "依赖下载完成！"

# 显示帮助
help:
	@echo "可用的命令："
	@echo "  make build       - 编译服务端和客户端"
	@echo "  make run-server  - 运行服务端"
	@echo "  make run-client  - 运行客户端"
	@echo "  make test        - 运行测试"
	@echo "  make clean       - 清理编译产物"
	@echo "  make deps        - 下载依赖"
	@echo "  make help        - 显示此帮助信息"
