import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:1214`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function onSocketClose() {
  console.log("너 브라우저에서 나갔구나!?");
}

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "이름 없는 놈";
  console.log("헐 브라우저랑 연결됨!");
  socket.on("close", onSocketClose);

  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          //   aSocket.send(`${socket.nickname}: ${message.payload}`)
          aSocket.send(`익명이: ${message.payload}`)
        );
      //   case "nickname":
      //     socket["nickname"] = message.payload;
    } //
  });
});
server.listen(1214, handleListen);
