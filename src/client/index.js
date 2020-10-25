import SearchBar from './component/search-bar.js';
import SocketList from './component/socket-list.js';
import Player from './component/player.js';
import Queue from './component/queue.js';

const socket = io();
const search = new SearchBar();
const sockets = new SocketList(socket);
const player = new Player(sockets);
const queue = new Queue(sockets, search, player);
