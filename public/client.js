"use strict";

const Socket = io();

/**
 * Id of this client socket
 */
let Client;

/**
 * Id of this client target
 */
let Target;

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

Socket.on('socket:setOrigin', (origin) => {
    setOrigin(origin);

    forEachSocketBut((socket) => {
        setIsDisabled(socket.id);
    }, [Client, origin]);
});

Socket.on('socket:resetOrigin', (origin) => {
    resetOrigin(origin);

    forEachSocketBut((socket) => {
        setIsFree(socket.id);
    }, [Client, origin]);
});

Socket.on('socket:isOrigin', (socket) => {
    setIsOrigin(socket);
});

Socket.on('socket:isTarget', (socket) => {
    setIsTarget(socket);
});

Socket.on('socket:isFree', (socket) => {
    setIsFree(socket);
});

/**
 * Execute a callback in every socket but the specified ones
 * @param {Closue} callback Function to execute
 * @param {Array} exclude List of ids of sockets to exclude from loop
 */
const forEachSocketBut = (callback, exclude) => {
    Sockets.forEach((socket) => {
        if (!exclude.includes(socket.id)) {
            callback(socket);
        }
    });
};

const newSocket = (socket) => {
    let item = document.createElement('li');

    item.setAttribute('id', '#socket' + socket.id);
    item.setAttribute('socketid', new String(socket.id));
    item.innerText = `${socket.userAgent.browser.name} @ ${socket.userAgent.os.name} ${socket.userAgent.device.type}`;

    item.setAttribute('class', 'hoverBlackLight');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'handleSetTarget(event)');

    if (socket.id == Client) {
        item.setAttribute('class', 'disabled')
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

const setIsFree = (id) => {
    let item = document.getElementById('#socket' + id);

    item.setAttribute('class', 'hoverBlackLight');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'handleSetTarget(event)');
}

const setIsDisabled = (id) => {
    let item = document.getElementById('#socket' + id);

    item.setAttribute('class', 'disabled hoverBlackLight');
    item.setAttribute('title', "You can't emit to other users while someone is emitting to you.");
    item.setAttribute('onclick', null);
};

const setIsOrigin = (id) => {
    let item = document.getElementById('#socket' + id);

    item.setAttribute('class', 'disabled textBlue hoverBlackLight');
    item.setAttribute('title', 'This user is already emitting to someone.');
    item.setAttribute('onclick', null);
};

const setIsTarget = (id) => {
    let item = document.getElementById('#socket' + id);

    item.setAttribute('class', 'disabled textGreen hoverBlackLight');
    item.setAttribute('title', 'Someone is already emitting to this user.');
    item.setAttribute('onclick', null);
};

const setOrigin = (origin) => {
    let item = document.getElementById('#socket' + origin);

    item.setAttribute('class', 'textBlue bgBlackLight');
    item.setAttribute('title', 'This user is emitting to you.');
    item.setAttribute('onclick', null);
};

const resetOrigin = (origin) => {
    let item = document.getElementById('#socket' + origin);

    item.setAttribute('class', 'hoverBlackLight');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'handleSetTarget(event)');
}

const handleSetTarget = (event) => {
    let target = event.target.getAttribute('socketid');

    if (Target !== Client) {
        resetTarget(Target);
    }
    setTarget(target);
}

const setTarget = (target) => {
    let item = document.getElementById('#socket' + target);

    item.setAttribute('class', 'textGreen bgBlackLight');
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

    item.setAttribute('class', 'hoverBlackLight');
    item.setAttribute('title', 'Emit to this user.');
    item.setAttribute('onclick', 'handleSetTarget(event)');

    Target = Client;
    Socket.emit('socket:resetTarget', target);
}
