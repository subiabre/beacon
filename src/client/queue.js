class Queue
{
    constructor(socket)
    {
        this.socket = socket;
        this.items = [];

        this.handleAddQueue = this.handleAddQueue.bind(this);
        
        socket.on('queue:getQueue', (queue) => {
            this.queue = queue;
            this.items = JSON.parse(queue.items) || [];

            this.updateQueue(this.items);
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

    /**
     * Push data item to items array
     * @param {Object} data 
     */
    addToQueue(data)
    {
        let index = this.items.push(data) - 1;
        let list = document.getElementById('queue');
        let item = this.newItem(data, index);

        list.appendChild(item);        
    }

    /**
     * Draw the queue
     * @param {Array} items 
     */
    updateQueue(items)
    {
        items.forEach((item) => {
            this.addToQueue(item);
        })
    }

    handleAddQueue(data)
    {
        this.addToQueue(data);
        this.socket.emit('queue:addToQueue', JSON.stringify(this.items));
    }
}

export default Queue;
