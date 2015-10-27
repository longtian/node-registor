# node-registor

[![](https://badge.imagelayers.io/wyvernnot/node-registor:latest.svg)](https://imagelayers.io/?images=wyvernnot/node-registor:latest 'Get your own badge on imagelayers.io')

利用 Docker API 和 WebSocket 做服务发现

## 使用

启动 Registor

```
sudo docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock:ro wyvernnot/node-registor
```

Registor 会启动一个 Server

这个 Server 除了启动一个简单的页面，还会在相同的端口监听 WebSocket 的请求

## 例子

监听 Docker 上所有暴露了外部端口的 WebServer 容器，一次性返回它们的 HTTP 请求头

[这里](example/server_farm)