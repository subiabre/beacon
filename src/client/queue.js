class Queue
{
    constructor(socket)
    {
        this.socket = socket;
        this.items = [];

        this.handleAddQueue = this.handleAddQueue.bind(this);
        this.handleRemoveQueue = this.handleRemoveQueue.bind(this);
        
        socket.on('queue:getQueue', (queue) => {
            this.queue = queue;
            this.updateQueue(JSON.parse(queue.items) || []);
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
     * @param {Object} queue 
     * @param {Number} index
     */
    newItem(queue, index)
    {
        let item = document.createElement('li');

        item.setAttribute('id', '#queue' + index);
        item.setAttribute('queueindex', index);
        item.innerText = `${queue.title}`;

        return item;
    }

    setIsPlaying(data)
    {
        let item = this.getItem(data.index);

        item.setAttribute('class', 'bgWhite textGreen');
        item.setAttribute('title', 'Currently playing.');
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

        data.index = index;
        this.items.push(data);

        console.log(this.items);

        list.appendChild(item);        
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
        this.setIsPlaying(data);
    }

    handleAddQueue(data)
    {
        this.addToQueue(data);
        this.socket.emit('queue:addToQueue', JSON.stringify(this.items));
    }

    handleRemoveQueue(data)
    {
        this.removeFromQueue(data);
        this.socket.emit('queue:addToQueue', JSON.stringify(this.items));
    }
}

export default Queue;
