const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methos: ["GET", "POST"],
  },
  transports: ["websocket", "polling", "flashsocket"],
});

app.use(cors());

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("server is running ...");
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  socket.on("disconnect", () => {
    socket.broadcast.emit("cancellended");
  });

  socket.on(
    "calluser",
    ({ userToCall, signalData, from, dialerEmail, name }) => {
      io.to(userToCall).emit("calluser", {
        signal: signalData,
        from,
        dialerEmail,
        name,
      });
    }
  );
  socket.on("answerCall", (data) => {
    // console.log("From answerCall :", data.to);
    io.to(data.to).emit("callAccepted", data);
  });
  socket.on("dialeremailadd", (fromEmail) => {
    // console.log("From email recieved", fromEmail);
  });
  socket.on("message", ({ sender, message, identification, reciever, me }) => {
    // console.log("User message", {
    //   sender,
    //   message,
    //   identification,
    //   reciever,
    //   me,
    // });
    io.to(reciever).emit("messageToReciever", { sender, message });
  });
});

server.listen(PORT, () => {
  console.log(`listning started on ${PORT}......`);
});
