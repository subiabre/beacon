import SocketList from './socketlist.js';
import ApiRequest from './apirequest.js';
import Queue from './queue.js';

const socket = io();
const sockets = new SocketList(socket);
const queue = new Queue(socket);
const apiRequest = new ApiRequest();

const updatePlayer = (data) => {
    let content = document.getElementById('content');
    let contentTitle = document.getElementById('contenttitle');

    contentTitle.innerHTML = data.title;
    
    content.pause();
    content.src = data.source.video;
    content.load();
    content.play();
}

const handleSearch = (event) => {
    let input = document.getElementById('searchinput');
    let query = input.value;

    if (query.match(/(https)?(\:\/\/)?(www\.)?youtu(\.)?be(\.com)?\//)) {
        input.value = '';
        
        apiRequest.youtube(query, (data) => {
            queue.handleAddQueue(data);
        });
    }

    return false;
}

const handlePlay = () => {
    socket.emit('play:youtube', sockets.target, queue.items[0]);
    queue.handlePlay(queue.items[0]);
}

const handlePlayYoutube = (data) => {
    updatePlayer(data);
}

window.handlePlay = handlePlay;
window.handleSearch = handleSearch;
window.handlePlayYoutube = handlePlayYoutube;
