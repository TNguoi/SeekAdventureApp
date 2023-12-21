import { v4 as uuidv4 } from 'uuid';
import 'react-bootstrap';
import './App.css';
import { io } from 'socket.io-client';
import { useRef } from 'react';
import { Game } from './Game';
import { Stack, Button, Form } from 'react-bootstrap';

function App() {
  let messageInput = useRef(null);
  let roomIdInput = useRef(null);
  let usernameInput = useRef(null);
  let gameWindow = useRef(null);
  let roomId = '';

  let username = '';
  let server_url = '';
  if (process.env.REACT_APP_SERVER_URL === undefined) {
    server_url = 'localhost:8080';
  } else {
    server_url = process.env.REACT_APP_SERVER_URL;
  }
  console.log('url is :' + server_url);
  const socket = io(server_url, {
    withCredentials: false,
    extraHeaders: {
      'sa-client': 'client',
    },
    autoConnect: false,
  });

  socket.on('connect', () => {
    appendMessage('System', 'You are now connected to the server.');
  });

  socket.on('disconnect', () => {
    appendMessage('System', 'You are now disconnected from the server.');
  });

  socket.on('server-message', (author, message) => {
    appendMessage(author, message);
  });

  socket.on('sync-game', (data) => {
    appendMessage('Game', data);
  });

  const appendMessage = (author, text) => {
    document.getElementById('message').innerHTML += `<br>${author}: ${text}`;
  };

  const setUsername = () => {
    username = usernameInput.current.value;
    appendMessage('System', `Your name is now ${username}`);
  };

  const generateRoomId = () => {
    roomId = uuidv4();
    roomIdInput.current.value = roomId;
  };
  const createAndJoinRoom = () => {
    generateRoomId();
    socket.connect();
    socket.emit('create-room', roomId);

    appendMessage(
      'System',
      `Your room id is ${roomId}, you are now joined in this room.`
    );
  };

  const leaveRoom = () => {
    roomId = '';
    socket.disconnect();
  };

  const joinRoom = () => {
    roomId = roomIdInput.current.value;
    socket.connect();
    socket.emit('join-room', roomId);
    appendMessage(
      'System',
      `Your room id is ${roomId}, you are now joined in this room.`
    );
  };

  const sendMessage = () => {
    if (username === '') {
      appendMessage('System', 'Please set your username first');
      return;
    }

    if (socket.disconnected) {
      appendMessage('System', 'Please join or create a room first');
      return;
    }

    const message = messageInput.current.value;
    console.log(message);
    const author = username;

    if (message === '') {
      return;
    }

    messageInput.current.value = '';
    socket.emit('message', author, message);
  };

  console.profile();

  return (
    <div className='App'>
      <link
        rel='stylesheet'
        href='https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css'
      ></link>
      <Stack space='large'>
        <Stack direction='horizontal' space='small' collapseBelow='desktop'>
          <Button variant='primary' onClick={createAndJoinRoom}>
            Create Room
          </Button>
          <Button variant='primary' onClick={leaveRoom}>
            Leave Room
          </Button>
          <Button variant='primary' onClick={setUsername}>
            Set User Name
          </Button>
          <Button variant='primary' onClick={joinRoom}>
            Join Room
          </Button>
          <Button variant='primary' onClick={sendMessage}>
            Send
          </Button>
        </Stack>
        <div style={{ verticalAlign: 'left' }}>
          <Form.Label>Room ID</Form.Label>
          <Form.Control
            type='text'
            ref={roomIdInput}
            aria-describedby='roomIdInputDescribe'
          />
          <Form.Text id='roomIdInputDescribe' muted>
            Enter your room ID here to join a room, or generate one upon
            creating a new room.
          </Form.Text>
        </div>
        <div style={{ verticalAlign: 'left' }}>
          <Form.Label>Username</Form.Label>
          <Form.Control type='text' ref={usernameInput} />
        </div>
        <div style={{ verticalAlign: 'left' }}>
          <Form.Label>Chat here:</Form.Label>
          <Form.Control type='text' ref={messageInput} />
        </div>
        <div ref={gameWindow}>
          <Game></Game>
        </div>
        <text id='message' label='Messages'>
          Messages are shown here:
        </text>
      </Stack>
    </div>
  );
}

export default App;
