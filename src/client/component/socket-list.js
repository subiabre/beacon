/**
 * Component that manages the socket list
 */
class SocketList
{
    /**
     * 
     * @param {SocketIO.Socket} socket 
     */
    constructor(socket)
    {
        /**
         * @param {Socket}
         */
        this.socket = socket;
        
        this.handleSetTarget = this.handleSetTarget.bind(this);
        this.handleResetTarget = this.handleResetTarget.bind(this);

        socket.on('connect', () => {
            this.client = socket.id;
            this.target = socket.id;
        });
        
        socket.on('socket:update', (list) => {
            this.sockets = list;
        
            this.updateSocketList(list);
        });
        
        socket.on('socket:isClient', (client) => {
            this.target = client.targetId || this.client;
            this.origin = client.originId || this.client;
        
            this.updateClientSockets(client);
        });


        socket.on('socket:setOrigin', (origin) => {
            this.handleSetOrigin(origin);
        });

        socket.on('socket:resetOrigin', (origin) => {
            this.handleResetOrigin(origin);
        });

        socket.on('socket:isOrigin', (socket) => {
            this.setDisabled(socket);
        });

        socket.on('socket:isTarget', (socket) => {
            this.setDisabled(socket);
        });

        socket.on('socket:isFree', (socket) => {
            this.setAvailable(socket);
        });

        socket.on('play:youtube', (url) => {
            handlePlayYoutube(url);
        });
    }

    /**
     * Get the list item of a socket
     * @param {String} socket Socket id 
     */
    getItem(socket)
    {
        let item = document.getElementById('#socket' + socket);

        return item ? item : false;
    }

    /**
     * Create a list item from a socket
     * @param {SocketIO.Socket} socket 
     */
    newItem(socket)
    {
        let item = document.createElement('li');

        item.setAttribute('id', '#socket' + socket.id);
        item.setAttribute('socketid', new String(socket.id));
        item.innerText = `${socket.userAgent.browser.name} @ ${socket.userAgent.os.name} ${socket.userAgent.device.type}`;

        return item;
    }

    setIsClient(id)
    {
        let item = this.getItem(id);

        item.setAttribute('class', 'disabled')
        item.setAttribute('title', 'You are this user.');
        item.removeEventListener('click', this.handleSetTarget);
        item.removeEventListener('click', this.handleResetTarget);
    }

    setOrigin(id)
    {
        let item = this.getItem(id);

        item.setAttribute('class', 'textBlue bgBlackLight');
        item.setAttribute('title', 'This user is emitting to you.');
        item.removeEventListener('click', this.handleSetTarget);
        item.removeEventListener('click', this.handleResetTarget);
    }

    setTarget(id)
    {
        let item = this.getItem(id);

        item.setAttribute('class', 'textGreen bgBlackLight');
        item.setAttribute('title', 'You are emitting to this user.');
        item.removeEventListener('click', this.handleSetTarget);
        item.addEventListener('click', this.handleResetTarget);
    }

    setAvailable(id)
    {
        let item = this.getItem(id);

        item.setAttribute('class', 'hoverBlackLight');
        item.setAttribute('title', 'Emit to this user.');
        item.removeEventListener('click', this.handleResetTarget);
        item.addEventListener('click', this.handleSetTarget);
    }

    setDisabled(id)
    {
        let item = this.getItem(id);

        item.setAttribute('class', 'disabled hoverBlackLight');
        item.setAttribute('title', "You can't emit to this user.");
        item.removeEventListener('click', this.handleSetTarget);
        item.removeEventListener('click', this.handleResetTarget);
    }

    /**
     * Fills the list of sockets
     * @param {Array} sockets List of sockets objects
     */
    updateSocketList(sockets)
    {    
        let list = document.getElementById('sockets');
        
        list.innerHTML = '';
        for (let index = 0; index < sockets.length; index++) {
            const socket = sockets[index];
            let item = this.getItem(socket.id);

            if(!item) {
                item = this.newItem(socket);
                list.appendChild(item);
            }

            if (socket.id == this.client) {
                this.setIsClient(socket.id);
                continue;
            }

            if (socket.id == this.origin) {
                this.setOrigin(socket.id);
                continue;
            }

            if (socket.id == this.target) {
                this.setTarget(socket.id);
                continue;
            }

            if (socket.isAvailable) {
                this.setAvailable(socket.id);
            }

            if (!socket.isAvailable) {
                this.setDisabled(socket.id);
            }
        }
    }

    /**
     * Updates the sockets that the client was paired to
     * @param {socketModel} client A socketModel instance
     */
    updateClientSockets(client)
    {
        if (client.targetId) {
            this.setTarget(client.targetId);
        }

        if (client.originId) {
            this.setOrigin(client.originId);
        }
    }

    /**
     * Execute a callback in every socket but the specified ones
     * @param {Closure} callback Function to execute
     * @param {Array} exclude List of ids of sockets to exclude from loop
     */
    forEachSocketBut(callback, exclude)
    {
        this.sockets.forEach((socket) => {
            if (!exclude.includes(socket.id)) {
                callback(socket);
            }
        });
    }

    handleSetTarget(event)
    {
        let target = event.target.getAttribute('socketid');

        if (this.target !== this.client) {
            this.setAvailable(this.target);
            this.socket.emit('socket:resetTarget', this.target)
            console.log('reset old target')
        }

        this.setTarget(target);

        this.target = target;
        this.socket.emit('socket:setTarget', target);
    }

    handleResetTarget(event)
    {
        let target = event.target.getAttribute('socketid');
        
        this.setAvailable(target);

        this.target = this.client;
        this.socket.emit('socket:resetTarget', target);
    }

    handleSetOrigin(origin)
    {
        this.origin = origin;

        this.setOrigin(origin);

        this.forEachSocketBut((socket) => {
            this.setDisabled(socket.id);
        }, [this.client, origin]);
    }

    handleResetOrigin(origin)
    {
        this.origin = this.client;

        console.log('reset origin received')
        this.setAvailable(origin);

        this.forEachSocketBut((socket) => {
            this.setAvailable(socket.id);
        }, [this.client, origin]);
    }
};

export default SocketList;
