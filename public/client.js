const socketList = document.getElementById('sockets');
const socketClient = io();
let   socketTarget = socketClient.id;

const newSocket = (socket) => {
    let item = document.createElement('li');
    
    item.setAttribute('socketid', socket.id);
    item.setAttribute('class', 'socket disabled');
    item.innerText = `${socket.userAgent.name} @ ${socket.userAgent.os} ${socket.userAgent.device_type}`;

    if (socket.id !== socketClient.id) {
        item.setAttribute('class', 'socket');
        item.setAttribute('onclick', 'selectTarget(event)');
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

const selectTarget = (event) => {
    let socketId = event.target.getAttribute('socketid');

    socketTarget = socketId;
    socketClient.emit('socket:choose', socketTarget);
};

socketClient.on('socket:update', (list) => {
    updateSocketList(list);
});
