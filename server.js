import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

const Nick = [
  "옥수수수염차",
  "사리곰탕",
  "나쁜늑대",
  "퇴근하고싶다",
  "짭프로도",
  "외계인",
  "파란괴물",
  "밤식빵",
  "아무꺼도없는",
  "하느",
];

const NickRandom = Nick[Math.floor(Math.random() * Nick.length)];

wsServer.on("connection", (socket) => {
  socket["nickname"] = NickRandom;
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// const sockets = [];
// function onSocketClose() {
//  console.log("너 브라우저에서 나갔구나!?");
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "이름 없는 놈";
//   console.log("헐 브라우저랑 연결됨!");
//   socket.on("close", onSocketClose);

//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//             aSocket.send(`${socket.nickname}: ${message.payload}`)
//           // aSocket.send(`익명이: ${message.payload}`)
//         );
//         case "nickname":
//           socket["nickname"] = message.payload;
//     }
//   });
// });

const handleListen = () => console.log(`작동되구있음 http://localhost:3000`);
httpServer.listen(3000, handleListen);