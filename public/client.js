"use strict";

const Socket = io();
let Client;
let Target;

Socket.on('connect', () => {
    Client = Socket.id;
    Target = Socket.id;
});

Socket.on('socket:update', (list) => {
    updateSocketList(list);
});

Socket.on('socket:setOrigin', (origin) => {
    setOrigin(origin)
});

Socket.on('socket:resetOrigin', (origin) => {
    resetOrigin(origin);
});

const newSocket = (socket) => {
    let item = document.createElement('li');
    
    item.setAttribute('id', '#socket' + socket.id);
    item.setAttribute('socketid', new String(socket.id));
    item.setAttribute('class', 'socket');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'handleSetTarget(event)');
    item.innerText = `${socket.userAgent.name} @ ${socket.userAgent.os} ${socket.userAgent.device_type}`;

    if (socket.id == Client) {
        item.setAttribute('class', 'socket disabled');
        item.setAttribute('title', 'You are this user.');
        item.setAttribute('onclick', null);
    }

    return item;
};

const updateSocketList = (sockets) => {    
    let list = document.getElementById('sockets');
    
    list.innerHTML = '';
    sockets.forEach(socket => {
        let item = newSocket(socket);
        list.appendChild(item);
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

    resetTarget(Target);
    setTarget(target);
}

const setTarget = (target) => {
    let item = document.getElementById('#socket' + target);

    item.setAttribute('class', 'socket target');
    item.setAttribute('title', 'You are emitting to this user.');
    item.setAttribute('onclick', 'handleResetTarget(event)');

    Target = target;
    Socket.emit('socket:setTarget', target);
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

    Target = Client;
    Socket.emit('socket:resetTarget', target);
}
