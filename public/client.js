const socketList = document.getElementById('sockets');
const socketClient = io();
let   socketTarget = socketClient.id;

const newSocket = (socket) => {
    let item = document.createElement('li');
    
    item.setAttribute('id', '#socket' + socket.id);
    item.setAttribute('socketid', new String(socket.id));
    item.setAttribute('class', 'socket');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'handleSetTarget(event)');
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
    item.setAttribute('onclick', 'handleSetTarget(event)');
}

const handleSetTarget = (event) => {
    let target = event.target.getAttribute('socketid');

    resetTarget(socketTarget);
    setTarget(target);
}

const setTarget = (target) => {
    let item = document.getElementById('#socket' + target);

    item.setAttribute('class', 'socket target');
    item.setAttribute('title', 'You are emitting to this user.');
    item.setAttribute('onclick', 'handleResetTarget(event)');

    socketTarget = target;
    socketClient.emit('socket:setTarget', target);
};

const handleResetTarget = (event) => {
    let target = event.target.getAttribute('socketid');
    
    resetTarget(target);
}

const resetTarget = (target) => {
    let item = document.getElementById('#socket' + target);

    item.setAttribute('class', 'socket');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'handleSetTarget(event)');

    socketTarget = socketClient.id;
    socketClient.emit('socket:resetTarget', target);
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
