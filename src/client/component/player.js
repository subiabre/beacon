import EventEmitter from 'events';

class Player extends EventEmitter
{
    constructor(sockets)
    {
        super();

        this.sockets = sockets;
        this.socket = sockets.socket;

        this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
        this.handleEnded = this.handleEnded.bind(this);

        this.socketEvents(sockets.socket);
    }

    socketEvents(socket)
    {
        socket.on('play:getInteraction', () => {
            this.getInteraction();
        });

        socket.on('play:getData', (data) => {
            this.updatePlayer(data);
        });

        socket.on('play:getCurrentTime', time => {
            console.log(time);
        });

        socket.on('play:getEnded', () => {
            console.log(`playback ended`);
        });
    }

    getInteraction()
    {
        let prompt = document.createElement('div');
        let body = document.body;

        prompt.setAttribute('class', 'Window bgBlackLight shadowBlack textWhite width50');
        prompt.addEventListener('click', this.registerInteraction);
        prompt.innerHTML = `Content playing is disabled until you interact with this window. Please click anywhere on this message to enable content playing.`;

        body.appendChild(prompt);
    }

    registerInteraction(event)
    {
        let prompt = event.target;
        let body = document.body;

        body.removeChild(prompt);
    }
    
    updatePlayer(data)
    {
        let content = document.getElementById('content');
        let contentTitle = document.getElementById('contenttitle');
    
        contentTitle.setAttribute('class', 'screenTitle textWhite')
        contentTitle.innerHTML = data.title;
        
        content.setAttribute('class', 'Screen screenContent75 bgBlack75');
        content.addEventListener('play', this.handleTimeUpdate);
        content.addEventListener('ended', this.handleEnded);

        content.pause();
        content.src = data.source.video;
        content.load();
        content.play();
    }

    handleTimeUpdate()
    {
        let content = document.getElementById('content');

        this.contentTime = setInterval(() => {
            this.socket.emit('play:setCurrentTime', content.currentTime);
        }, 1000);
    }

    /**
     * 
     * @param {HTMLElement} content 
     */
    handleEnded()
    {
        let content = document.getElementById('content');

        clearInterval(this.contentTime);

        content.removeEventListener('play', this.handleTimeUpdate);
        content.removeEventListener('ended', this.handleEnded);
        
        this.socket.emit('play:setEnded');
    }
}

export default Player;
