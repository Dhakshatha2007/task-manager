require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// --- Socket.IO setup ---------------------------------------------------
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

// Authenticate each socket connection using the same JWT used for the REST API.
// Client connects with: io(url, { auth: { token } })
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required."));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.id;
    next();
  } catch (err) {
    next(new Error("Invalid or expired token."));
  }
});

io.on("connection", (socket) => {
  // Put each user in their own room so task events only reach that user's
  // other open tabs/devices, not every connected client.
  socket.join(`user:${socket.userId}`);

  socket.on("disconnect", () => {
    socket.leave(`user:${socket.userId}`);
  });
});

// Make io available to route controllers via req.app.get("io")
app.set("io", io);

// --- REST routes ---------------------------------------------------------
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Task Manager API listening on port ${PORT}`);
});
