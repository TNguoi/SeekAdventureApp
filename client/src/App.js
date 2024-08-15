import { v4 as uuidv4 } from 'uuid';
import 'react-bootstrap';
import './App.css';
import { io } from 'socket.io-client';
import { useRef } from 'react';
import { Stack, Button, Form } from 'react-bootstrap';
import { useState } from 'react';

function App() {
  let messageInput = useRef(null);
  let usernameInput = useRef(null);
  let gameWindow = useRef(null);
  let createRoomSection = useRef(null);
  let setUsernameSection = useRef(null);
  let mainGameSection = useRef(null);
  let roomIdDisplay = useRef(null);
  const [game, setGame] = useState('<tr></tr>');

  let roomId = '';
  let userId = '';
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
    //appendMessage('Game', data);
    //function to sync and render elements
    let newGameState = '<table><tr><th>Username</th><th>Vote</th></tr>';
    console.log(data);

    const gameState = JSON.parse(data);

    for (let i = 0; i < gameState.users.length; i++) {
      let vote = '';
      if (gameState.reveal) {
        vote = gameState.users[i].vote;
      } else {
        if (gameState.users[i].vote === 0) {
          vote = 'Waiting for vote...';
        } else {
          vote = 'Voted';
        }
      }
      newGameState +=
        '<tr><td>' +
        gameState.users[i].username +
        '</td><td>' +
        vote +
        '</td></tr>';
    }
    newGameState += '</table>';
    document.getElementById('gameStateUpdate').innerHTML = newGameState;
  });

  const appendMessage = (author, text) => {
    document.getElementById('message').innerHTML += `<br>${author}: ${text}`;
  };

  const setUsername = () => {
    username = usernameInput.current.value;
    setUsernameSection.current.style.display = 'none';
    mainGameSection.current.style.display = 'block';
    socket.emit('set-username', userId, username);
    appendMessage('System', `Your name is now ${username}`);
  };

  const setUserVote = (vote) => {
    socket.emit('set-vote', userId, vote);
  };

  const revealCards = () => {
    socket.emit('set-reveal', true);
  };

  const resetCards = () => {
    socket.emit('reset');
  };

  const generateRoomId = () => {
    roomId = uuidv4();
  };

  const generateUserId = () => {
    userId = uuidv4();
  };

  const createAndJoinRoom = () => {
    generateRoomId();
    window.location.href = server_url + '?roomId=' + roomId + '&isHost=1';
  };

  const sendMessage = () => {
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
    generateUserId();
    if (host) {
      socket.connect();
      socket.emit('create-room', roomId, userId);

      appendMessage(
        'System',
        `Room created.\nYour room id is ${roomId}, you are now joined in this room.\nYou can forward the link to invite others to join.`
      );
    } else {
      socket.connect();
      socket.emit('join-room', roomId, userId);
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

  //no idea why this will run twice unless I put a timeout on it
  setTimeout(() => {
    if (params.has('roomId')) {
      roomId = params.get('roomId');
      if (params.has('isHost')) {
        joinRoomByInvite(true);
      } else {
        joinRoomByInvite(false);
      }
    }
  }, 100);

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
          <Stack>
            <div id='gameStateUpdate'></div>
          </Stack>
          <br></br>
          <Stack>
            <Button onClick={revealCards}>Show Cards</Button>
            <Button onClick={resetCards}>Reset Cards</Button>
          </Stack>
          <br></br>
          <Stack>
            <Button
              onClick={() => {
                setUserVote(1);
              }}
            >
              1
            </Button>
            <Button
              onClick={() => {
                setUserVote(2);
              }}
            >
              2
            </Button>
            <Button
              onClick={() => {
                setUserVote(3);
              }}
            >
              3
            </Button>
            <Button
              onClick={() => {
                setUserVote(5);
              }}
            >
              5
            </Button>
            <Button
              onClick={() => {
                setUserVote(8);
              }}
            >
              8
            </Button>
            <Button
              onClick={() => {
                setUserVote(13);
              }}
            >
              13
            </Button>
            <Button
              onClick={() => {
                setUserVote('?');
              }}
            >
              ?
            </Button>
          </Stack>
        </div>
        <text id='message' label='Messages'>
          Messages are shown here:
        </text>
      </Stack>
    </div>
  );
}

export default App;
