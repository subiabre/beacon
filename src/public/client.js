import SocketList from './socketlist.js';
import ApiRequest from './apirequest.js';

const socket = io();
const sockets = new SocketList(socket);
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
        //clearInput(input);

        socket.emit('play:youtube', sockets.target, query);
    }

    return false;
}

const handlePlayYoutube = (youtube) => {
    apiRequest.youtube(youtube, (data) => {
        updatePlayer(data);
    });
}

window.handleSearch = handleSearch;
window.handlePlayYoutube = handlePlayYoutube;
