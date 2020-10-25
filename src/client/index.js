import SearchBar from './component/search-bar.js';
import SocketList from './component/socket-list.js';
import Queue from './component/queue.js';

const socket = io();
const search = new SearchBar();
const sockets = new SocketList(socket);
const queue = new Queue(sockets, search);

const updatePlayer = (data) => {
    let content = document.getElementById('content');
    let contentTitle = document.getElementById('contenttitle');

    contentTitle.innerHTML = data.title;
    
    content.pause();
    content.src = data.source.video;
    content.load();
    content.play();
}

const handlePlay = () => {
    queue.handlePlay(queue.items[0]);
}

const handlePlayYoutube = (data) => {
    updatePlayer(data);
}

window.handlePlay = handlePlay;
window.handlePlayYoutube = handlePlayYoutube;
