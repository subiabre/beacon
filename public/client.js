const socketList = document.getElementById('sockets');

const newSocket = (socket) => {
    let item = document.createElement('li');
    
    item.setAttribute('id', 'socket' + socket.id);
    item.setAttribute('class', 'socket');
    item.innerText = `${socket.userAgent.name} @ ${socket.userAgent.os} ${socket.userAgent.device_type}`;
    return item;
};

const updateSocketList = (list) => {    
    socketList.innerHTML = '';
    list.forEach(socket => {
        let item = newSocket(socket);
        socketList.appendChild(item);
    });
}

const socket = io();

socket.on('socket:update', (list) => {
    updateSocketList(list);
});
