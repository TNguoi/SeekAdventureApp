import express from 'express';
import { createServer } from 'node:http';
import { Server as SocketIoServer } from 'socket.io';
import cors from 'cors';
import { Game } from './game.js';

const port = process.env.port || 8080;
const app = express();
const server = createServer(app);
const io = new SocketIoServer(server, {
  cors: {
    origin: 'https://seekadventureapp.onrender.com/',
    methods: ['GET', 'POST'],
  },
});
const SOCKET_TIMEOUT = 15000;
let gameRooms = {};

app.get('/api', (req, res) => {
  res.send('hello world');
});

app.use(express.static('client/build'));

io.on('connection', (socket) => {
  let roomId = '';
  let host = false;
  let game = {};
  const checkConnectionInterval = setInterval(() => {
    if (socket.connected) {
      //console.log('Connection is still active');
    } else {
      console.log('Connection timed out');
    }
  }, SOCKET_TIMEOUT);

  console.log('A user connected');
  socket.on('disconnect', () => {
    clearInterval(checkConnectionInterval);
    console.log('A user disconnected');
  });

  socket.on('message', (author, message) => {
    console.log(`${author}:${message}:${roomId}`);
    io.to(roomId).emit('server-message', author, message);
  });

  socket.on('create-room', (newRoomId) => {
    console.log(`${newRoomId} room created`);
    socket.join(newRoomId);
    roomId = newRoomId;
    initRoomState();
  });
  socket.on('join-room', (newRoomId) => {
    roomId = newRoomId;
    socket.join(roomId);
    console.log('joined room ' + newRoomId);
    initRoomState();
  });

  socket.on('request-sync-game', () => {
    console.log('request-sync-game received');
    if (host) {
      console.log('host emitting sync-game');
      io.to(roomId).emit('sync-game', game.data());
    } else {
      console.log('not a host');
    }
  });

  socket.on('input', () => {});

  const update = () => {
    io.to(roomId).emit('sync-game', game.data());
  };

  const initRoomState = () => {
    let size = io.sockets.adapter.rooms.get(roomId).size;
    console.log('There are now a total client of ' + size);
    if (size === 1) {
      //create a game and assign host
      host = true;
      game = new Game();
      gameRooms[roomId] = game;

      console.log('host operation');
      update();
    } else {
      console.log('my room id is ' + roomId);
      console.log('sending request to sync');
      //io.to(roomId).emit('request-sync-game');
      if (!gameRooms.hasOwnProperty(roomId)) {
        socket.emit('server-message', 'error host did not create a game');
        return;
      }

      game = gameRooms[roomId];
      update();
    }
  };
});

server.listen(port, () => {
  console.log('Express server is up and listening at port ' + port);
});
