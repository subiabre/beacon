import SocketList from './component/socket/list.js';
import Queue from './component/queue.js';
import api from './service/api.js';

const socket = io();
const sockets = new SocketList(socket);
const queue = new Queue(sockets);

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
        
        api.youtube(query, (data) => {
            queue.handleAddQueue(data);
        });
    }

    return false;
}

const handlePlay = () => {
    queue.handlePlay(queue.items[0]);
}

const handlePlayYoutube = (data) => {
    updatePlayer(data);
}

window.handlePlay = handlePlay;
window.handleSearch = handleSearch;
window.handlePlayYoutube = handlePlayYoutube;
