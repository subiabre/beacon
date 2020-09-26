const $events = document.getElementById('events');

const newItem = (content) => {
    const item = document.createElement('li');
    item.innerText = content;
    return item;
};

const socket = io();

socket.on('socket:update', (list) => {
    $events.innerHTML = '';
    list.forEach(item => {
    $events.appendChild(newItem(`${item.id}`));
    });
});
