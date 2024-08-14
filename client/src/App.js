import { v4 as uuidv4 } from 'uuid';
import 'react-bootstrap';
import './App.css';
import { io } from 'socket.io-client';
import { useRef } from 'react';
import { Game } from './Game';
import { Stack, Button, Form } from 'react-bootstrap';

function App() {
  let messageInput = useRef(null);
  let usernameInput = useRef(null);
  let gameWindow = useRef(null);
  let createRoomSection = useRef(null);
  let setUsernameSection = useRef(null);
  let mainGameSection = useRef(null);
  let roomIdDisplay = useRef(null);

  let roomId = '';
  let username = '';
  //let server_url = 'https://seekadventureapp.onrender.com/';
  let server_url = 'http://localhost:8080';
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
    setUsernameSection.current.style.display = 'none';
    mainGameSection.current.style.display = 'block';
    appendMessage('System', `Your name is now ${username}`);
  };

  const generateRoomId = () => {
    roomId = uuidv4();
  };
  const createAndJoinRoom = () => {
    generateRoomId();
    window.location.href = server_url + '?roomId=' + roomId + '&isHost=1';
  };

  const leaveRoom = () => {
    roomId = '';
    socket.disconnect();
  };

  const joinRoom = () => {};

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

  const copyInvite = () => {
    navigator.clipboard.writeText(server_url + '?roomId=' + roomId);
  };

  const joinRoomByInvite = (host) => {
    if (host) {
      socket.connect();
      socket.emit('create-room', roomId);

      appendMessage(
        'System',
        `Your room id is ${roomId}, you are now joined in this room.`
      );
    } else {
      socket.connect();
      socket.emit('join-room', roomId);
      appendMessage(
        'System',
        `Your room id is ${roomId}, you are now joined in this room.`
      );
    }
    createRoomSection.current.style.display = 'none';
    setUsernameSection.current.style.display = 'block';
    roomIdDisplay.current.innerHTML = roomId;
  };

  const currentUrl = new URL(window.location.href);
  const params = new URLSearchParams(currentUrl.search);

  setTimeout(() => {
    if (params.has('roomId')) {
      roomId = params.get('roomId');
      if (params.has('isHost')) {
        console.log('hello I am running');
        joinRoomByInvite(true);
        console.log('running after');
      } else {
        joinRoomByInvite(false);
      }
    }
  }, 100);

  console.log('testa');

  return (
    <div className='App'>
      <link
        rel='stylesheet'
        href='https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css'
      ></link>

      <Stack ref={createRoomSection} space={'large'}>
        <p>Hello and welcome to Yet another Scrum Poker App</p>
        <p>Use the Create Room button below to create a room</p>
        <p>
          If you're trying to join the room, ask the host to send you the invite
          link
        </p>
        <Button variant='primary' onClick={createAndJoinRoom}>
          Create Room
        </Button>
      </Stack>

      <Stack
        ref={setUsernameSection}
        space={'large'}
        style={{ display: 'none' }}
      >
        <Stack direction='horizontal' space='small' collapseBelow='desktop'>
          What should we call you?
          <div style={{ verticalAlign: 'left' }}>
            <Form.Label>Username</Form.Label>
            <Form.Control type='text' ref={usernameInput} />
          </div>
          <Button variant='primary' onClick={setUsername}>
            Set User Name
          </Button>
        </Stack>
      </Stack>

      <Stack space='large' ref={mainGameSection} style={{ display: 'none' }}>
        <Button variant='primary' onClick={sendMessage}>
          Send
        </Button>
        <div style={{ verticalAlign: 'left' }}>
          <Stack>
            <div>
              Room ID: <p ref={roomIdDisplay}></p>
            </div>
            <Button onClick={copyInvite}>
              Click me to copy the invite link
            </Button>
          </Stack>
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
