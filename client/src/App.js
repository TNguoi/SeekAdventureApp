import 'braid-design-system/reset';
import wireframe from 'braid-design-system/themes/wireframe';
import { v4 as uuidv4 } from 'uuid';
import {
  BraidProvider,
  Text,
  Inline,
  Button,
  Stack,
  TextField,
} from 'braid-design-system';
import './App.css';
import { io } from 'socket.io-client';
import { useRef } from 'react';
import { Game } from './Game';

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

const appendMessage = (author, text) => {
  document.getElementById('message').innerHTML += `<br>${author}: ${text}`;
};

const setUsername = () => {
  username = document.getElementById('usernameInput').value;
  appendMessage('System', `Your name is now ${username}`);
};

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

function App() {
  let messageInput = useRef(null);
  let roomIdInput = useRef(null);
  let gameWindow = useRef(null);
  let roomId = '';

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
    <BraidProvider theme={wireframe} className='App'>
      <Stack space='large'>
        <Inline space='small' collapseBelow='desktop'>
          <Button variant='solid' onClick={createAndJoinRoom}>
            Create Room
          </Button>
          <Button variant='ghost' onClick={leaveRoom}>
            Leave Room
          </Button>
          <Button variant='solid' onClick={setUsername}>
            Set User Name
          </Button>
          <Button variant='solid' onClick={joinRoom}>
            Join Room
          </Button>
          <Button variant='solid' onClick={sendMessage}>
            Send
          </Button>
        </Inline>
        <TextField
          ref={roomIdInput}
          label='Room ID'
          // onChange={setState('textfield')}
          // value={getState('textfield')}
          tone='neutral'
        />
        <TextField
          id='usernameInput'
          label='Username'
          // onChange={setState('textfield')}
          // value={getState('textfield')}
          tone='neutral'
        />
        <TextField
          ref={messageInput}
          label='Chat here'
          // onChange={setState('textfield')}
          // value={getState('textfield')}
          tone='neutral'
        />
        <div ref={gameWindow}>
          <Game></Game>
        </div>
        <Text id='message' label='Messages'>
          Messages are shown here:
        </Text>
      </Stack>
    </BraidProvider>
  );
}

export default App;
