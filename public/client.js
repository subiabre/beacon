const socketList = document.getElementById('sockets');
const socketClient = io();
let   socketTarget = socketClient.id;

const newSocket = (socket) => {
    let item = document.createElement('li');
    
    item.setAttribute('socketid', socket.id);
    item.setAttribute('class', 'socket');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'setTarget(event)');
    item.innerText = `${socket.userAgent.name} @ ${socket.userAgent.os} ${socket.userAgent.device_type}`;

    if (socket.id == socketClient.id) {
        item.setAttribute('class', 'socket disabled');
        item.setAttribute('title', 'You are this user.');
        item.setAttribute('onclick', null);
    }

    return item;
};

const updateSocketList = (list) => {    
    socketList.innerHTML = '';
    list.forEach(socket => {
        let item = newSocket(socket);
        socketList.appendChild(item);
    });
}

const setTarget = (event) => {
    let item = event.target;
    let socketId = item.getAttribute('socketid');

    item.setAttribute('class', 'socket selected');
    item.setAttribute('title', 'You are emitting to this user.');
    item.setAttribute('onclick', 'resetTarget(event)');

    socketTarget = socketId;
    socketClient.emit('socket:choose', socketTarget);
};

const resetTarget = (event) => {
    let item = event.target;
    let socketId = socketClient.id;

    item.setAttribute('class', 'socket');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'setTarget(event)');

    socketTarget = socketId;
    socketClient.emit('socket:choose', socketTarget);
}

socketClient.on('socket:update', (list) => {
    updateSocketList(list);
});
