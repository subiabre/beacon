"use strict";

const Socket = io();

/**
 * @param {SocketIO.Socket} socket
 * @returns {Boolean}
 */
const socketIsClient = (socket) => {
    if (socket.id === Client) {
        return true;
    }

    return false;
}

/**
 * Execute a callback in every socket but the specified ones
 * @param {Closure} callback Function to execute
 * @param {Array} exclude List of ids of sockets to exclude from loop
 */
const forEachSocketBut = (callback, exclude) => {
    Sockets.forEach((socket) => {
        if (!exclude.includes(socket.id)) {
            callback(socket);
        }
    });
};

/**
 * Get the list item of a socket
 * @param {String} socket Socket id 
 */
const getSocketListItem = (socket) => {
    let item = document.getElementById('#socket' + socket);

    return item ? item : false;
}

/**
 * Create a list item from a socket
 * @param {SocketIO.Socket} socket 
 */
const newSocketListItem = (socket) => {
    let item = document.createElement('li');

    item.setAttribute('id', '#socket' + socket.id);
    item.setAttribute('socketid', new String(socket.id));
    item.innerText = `${socket.userAgent.browser.name} @ ${socket.userAgent.os.name} ${socket.userAgent.device.type}`;

    return item;
};

const socketItemSetIsClient = (id) => {
    let item = getSocketListItem(id);

    item.setAttribute('class', 'disabled')
    item.setAttribute('title', 'You are this user.');
    item.setAttribute('onclick', null);
}

const socketItemSetOrigin = (id) => {
    let item = getSocketListItem(id);

    item.setAttribute('class', 'textBlue bgBlackLight');
    item.setAttribute('title', 'This user is emitting to you.');
    item.setAttribute('onclick', null);
};

const socketItemSetTarget = (id) => {
    let item = getSocketListItem(id);

    item.setAttribute('class', 'textGreen bgBlackLight');
    item.setAttribute('title', 'You are emitting to this user.');
    item.setAttribute('onclick', 'handleResetTarget(event)');
};

const socketItemSetAvailable = (id) => {
    let item = getSocketListItem(id);

    item.setAttribute('class', 'hoverBlackLight');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'handleSetTarget(event)');
}

const socketItemSetDisabled = (id) => {
    let item = getSocketListItem(id);

    item.setAttribute('class', 'disabled hoverBlackLight');
    item.setAttribute('title', "You can't emit to this user.");
    item.setAttribute('onclick', null);
};

/**
 * Fills the list of sockets
 * @param {Array} sockets List of sockets objects
 */
const updateSocketList = async (sockets) => {    
    let list = document.getElementById('sockets');
    
    list.innerHTML = '';
    for (let index = 0; index < sockets.length; index++) {
        const socket = sockets[index];
        let item = getSocketListItem(socket.id);

        if(!item) {
            item = newSocketListItem(socket);
            list.appendChild(item);
        }

        if (socketIsClient(socket)) {
            socketItemSetIsClient(socket.id);
            continue;
        }

        if (socket.id == Origin) {
            socketItemSetOrigin(socket.id);
            continue;
        }

        if (socket.id == Target) {
            socketItemSetTarget(socket.id);
            continue;
        }

        if (socket.available) {
            socketItemSetAvailable(socket.id);
        }

        if (!socket.available) {
            socketItemSetDisabled(socket.id);
        }
    }
}

const updateClientSockets = (client) => {
    if (client.targetId) {
        socketItemSetTarget(client.targetId);
    }

    if (client.originId) {
        socketItemSetOrigin(client.originId);
    }
};

const handleSetTarget = (event) => {
    let target = event.target.getAttribute('socketid');

    if (Target !== Client) {
        socketItemSetAvailable(Target);
    }

    socketItemSetTarget(target);

    Target = target;
    Socket.emit('socket:setTarget', target);
}

const handleResetTarget = (event) => {
    let target = event.target.getAttribute('socketid');
    
    socketItemSetAvailable(target);

    Target = Client;
    Socket.emit('socket:resetTarget', target);
}

const handleSetOrigin = (origin) => {
    Origin = origin;

    socketItemSetOrigin(origin);

    forEachSocketBut((socket) => {
        socketItemSetDisabled(socket.id);
    }, [Client, origin]);
}

const handleResetOrigin = (origin) => {
    Origin = Client;

    socketItemSetAvailable(origin);

    forEachSocketBut((socket) => {
        socketItemSetAvailable(socket.id);
    }, [Client, origin]);
}

const handleSearch = (event) => {
    let query = document.getElementById('searchinput').value;

    handleYoutube(query);

    return false;
}

const handleYoutube = (url) => {
    if (!url.match(/(https)?(\:\/\/)?(www\.)?youtu(\.)?be(\.com)?\//)) {
        console.log('rejected youtube');
    }

    Socket.emit('play:youtube', Target, url);
}

const playYoutube = (url) => {
    let req = new XMLHttpRequest();
    
    req.addEventListener('load', (event) => {
        let req = event.target;
        let video = JSON.parse(req.responseText).data;
        let playerItem = document.getElementById('player');

        playerItem.src = '/api/youtube/audio/' + video.videoDetails.video_url;
        playerItem.pause();
        playerItem.load();
        playerItem.muted = true;
        
        let isPlaying = playerItem.play();
        if (isPlaying !== undefined) {
            playerItem.muted = false;
        }
    });

    req.open('GET', '/api/youtube/data/' + url);
    req.send();
}

/**
 * Id of this client socket
 */
let Client;

/**
 * Id of this client target
 */
let Target;

/**
 * Id of this client origin
 */
let Origin;

/**
 * List of connected sockets
 */
let Sockets;

Socket.on('connect', () => {
    Client = Socket.id;
    Target = Socket.id;
});

Socket.on('socket:update', (list) => {
    Sockets = list;

    updateSocketList(list);
});

Socket.on('socket:isClient', (client) => {
    Target = client.targetId ? client.targetId : Client;
    Origin = client.originId ? client.originId : Client;

    updateClientSockets(client);
});

Socket.on('socket:setOrigin', (origin) => {
    handleSetOrigin(origin);
});

Socket.on('socket:resetOrigin', (origin) => {
    handleResetOrigin(origin);
});

Socket.on('socket:isOrigin', (socket) => {
    setIsDisabled(socket);
});

Socket.on('socket:isTarget', (socket) => {
    setIsDisabled(socket);
});

Socket.on('socket:isFree', (socket) => {
    setIsFree(socket);
});

Socket.on('play:youtube', (url) => {
    playYoutube(url);
});
