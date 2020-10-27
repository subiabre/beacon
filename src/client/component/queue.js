import EventEmitter from 'events';

class Queue extends EventEmitter
{
    constructor(sockets, search)
    {
        super();

        this.sockets = sockets;
        this.socket = sockets.socket;
        this.items = [];
        this.isPlaying = null;

        this.handleAddQueue = this.handleAddQueue.bind(this);
        this.handlePlay = this.handlePlay.bind(this);
        this.handlePlayEvent = this.handlePlayEvent.bind(this);
        this.handleRemoveQueue = this.handleRemoveQueue.bind(this);

        this.socketEvents(sockets.socket);
        this.searchEvents(search);
    }

    socketEvents(socket)
    {
        socket.on('queue:getQueue', (queue) => {
            this.queue = queue;
            this.updateQueue(queue.list.items || []);
        });
    }

    searchEvents(search)
    {
        search.on('queue:getData', data => {
            this.handleAddQueue(data);
        });
    }

    /**
     * Get the list item of the queue
     * @param {String} id
     */
    getItem(id)
    {
        let item = document.getElementById('#queue' + id);

        return item ? item : false;
    }

    /**
     * Create a list item from a queue item
     * @param {Object} data
     * @param {Number} index
     */
    newItem(data, index)
    {
        let item = document.createElement('li');

        item.setAttribute('id', '#queue' + index);
        item.setAttribute('queueindex', index);
        item.innerText = `${data.title}`;

        return item;
    }

    setIsPlayable(data)
    {
        let item = this.getItem(data.index);

        item.setAttribute('class', 'bgWhite textBlack borderBottomGrey hoverWhiteGrey');
        item.setAttribute('title', 'Play this song.');
        item.addEventListener('click', this.handlePlayEvent);
    }

    setIsPlaying(data)
    {
        let item = this.getItem(data.index);

        item.setAttribute('class', 'bgWhiteGrey textGreen');
        item.setAttribute('title', 'Currently playing.');
        item.removeEventListener('click', this.handlePlayEvent);
    }

    /**
     * Push data item to items array
     * @param {Object} data 
     */
    addToQueue(data)
    {
        let last = this.items.slice(-1)[0];
        let index = (last ? last.index : 0) + 1;
        let list = document.getElementById('queue');
        let item = this.newItem(data, index);

        list.appendChild(item);

        data.index = index;
        this.items.push(data);

        this.setIsPlayable(data);
    }

    removeFromQueue(data)
    {
        let list = document.getElementById('queue');
        let item = this.getItem(data.index);

        this.items = this.items.filter((item) => item.index !== data.index);

        console.log(this.items);

        list.removeChild(item);
    }

    /**
     * Draw the queue
     * @param {Array} items 
     */
    updateQueue(items)
    {
        let list = document.getElementById('queue');
        list.innerHTML = '';

        items.forEach((item) => {
            this.addToQueue(item);
        })
    }

    handlePlay(data)
    {
        if (this.isPlaying) this.setIsPlayable(this.isPlaying);

        this.setIsPlaying(data);
        this.isPlaying = data;
        this.socket.emit('queue:play', this.sockets.target, data);
    }

    handlePlayEvent(event)
    {
        let index = event.target.getAttribute('queueindex');
        let data = this.items.filter(item => {
            return item.index == index;
        })[0];

        this.handlePlay(data);
    }

    handleAddQueue(data)
    {
        this.addToQueue(data);
        this.socket.emit('queue:addToQueue', this.items);
    }

    handleRemoveQueue(data)
    {
        this.removeFromQueue(data);
        this.socket.emit('queue:addToQueue', this.items);
    }
}

export default Queue;
