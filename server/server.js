const io = require('socket.io')();
const { createGameState, gameLoop, getUpdatedVelocity, initGame } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};
// create game state as soon as they connect and start sending them

io.on('connection', client => {

    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName){
        const room = io.sockets.adapter.rooms[roomName];

        let allUsers;
        if(room){
            allUsers = room.sockets;            // returns abjects for all users in the room
        }

        let numClients =0;
        if(allUsers){
            numClients = Object.keys(allUsers).length;   //grabbing an array of all of the keys in that object using Objject.keys and we got length of the array
        }

        if(numClients === 0){
            client.emit('unknownGame');
            return;
        }
        else if(numClients > 1){
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = roomName;
        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);

        startGameInterval(roomName);
    }

    function handleNewGame(){
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;   // player 1 has created the room
        client.emit('init', 1);
    }

    function handleKeydown(keyCode){
        const roomName = clientRooms[client.id];

        if(!roomName){
            return;
        }

        try{
            keyCode = parseInt(keyCode);
        }catch(e){
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if(vel){
            state[roomName].players[client.number - 1].vel = vel;
        }

    }

});

function startGameInterval(roomName){
    const intervalId = setInterval(() => {
        // game loop
        const winner = gameLoop(state[roomName]);

        if(!winner){
            emitGameState(roomName, state[roomName]);
        }else{
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000/FRAME_RATE);
}

function emitGameState(room, state){
    io.sockets.in(room)
        .emit('gameState', JSON.stringify(state));
}

function emitGameOver(room, winner){
    io.sockets.in(room)
        .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);