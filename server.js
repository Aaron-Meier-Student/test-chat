import os from "os";

function getIPs() {
  const nets = os.networkInterfaces();
  const results = {
    localhost: "127.0.0.1",
    lan: []
  };

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Only consider IPv4, non-internal addresses
      if (net.family === "IPv4" && !net.internal) {
        results.lan.push(net.address);
      }
    }
  }

  return results;
}

const ips = getIPs();
console.log("Localhost: http://127.0.0.1:3000");
ips.lan.forEach(ip => {
  console.log(`LAN: http://${ip}:3000`);
});

const http = require("http");
const WebSocket = require("ws");

// Create basic HTTP server (for health check / landing page)
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket chat server is running\n");
});

// Attach WebSocket server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New client connected!");

  ws.send("Welcome to the chat!");

  // When a client sends a message
  ws.on("message", (message) => {
    console.log("Received:", message.toString());

    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
