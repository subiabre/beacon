const socketList = document.getElementById('sockets');
const socketClient = io();
let   socketTarget = socketClient.id;

const newSocket = (socket) => {
    let item = document.createElement('li');
    
    item.setAttribute('id', '#socket' + socket.id);
    item.setAttribute('socketid', new String(socket.id));
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

const setOrigin = (origin) => {
    let item = document.getElementById('#socket' + origin);

    item.setAttribute('class', 'socket origin');
    item.setAttribute('title', 'This user is emitting to you.');
    item.setAttribute('onclick', null);
};

const resetOrigin = (origin) => {
    let item = document.getElementById('#socket' + origin);

    item.setAttribute('class', 'socket');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'setTarget(event)');
}

const setTarget = (event) => {
    let item = event.target;
    let socketId = item.getAttribute('socketid');

    item.setAttribute('class', 'socket target');
    item.setAttribute('title', 'You are emitting to this user.');
    item.setAttribute('onclick', 'resetTarget(event)');

    socketTarget = socketId;
    socketClient.emit('socket:setTarget', socketTarget);
};

const resetTarget = (event) => {
    let item = event.target;
    let previousTarget = item.getAttribute('socketid');
    let socketId = socketClient.id;

    item.setAttribute('class', 'socket');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'setTarget(event)');

    socketTarget = socketId;
    socketClient.emit('socket:resetTarget', previousTarget);
}

socketClient.on('socket:update', (list) => {
    updateSocketList(list);
});

socketClient.on('socket:setOrigin', (origin) => {
    setOrigin(origin)
});

socketClient.on('socket:resetOrigin', (origin) => {
    resetOrigin(origin);
});
