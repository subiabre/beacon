import EventEmitter from 'events';
import time from 'hh-mm-ss';

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
            this.updatePlayback(data);
        });

        socket.on('play:getContent', content => {
            this.updatePlayer(content);
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

    getContentVideo()
    {
        return document.getElementById('content');
    }

    getContentTitle()
    {
        return document.getElementById('contenttitle');
    }

    updatePlayer(content)
    {
        let player = document.createElement('div');
        let timeTotal = time.fromS(Math.round(content.duration));
        let timeCurrent = time.fromS(Math.round(content.currentTime));

        player.setAttribute('class', 'Input width100 floatingBottom bgBlack textWhite');
        player.innerHTML = `${timeCurrent} / ${timeTotal}` ;

        document.body.appendChild(player);
    }
    
    updatePlayback(data)
    {
        let content = this.getContentVideo();
        let contentTitle = this.getContentTitle();
    
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
        let content = this.getContentVideo();

        this.contentTime = setInterval(() => {
            this.socket.emit('play:setContent', {
                currentTime: content.currentTime,
                duration: content.duration,
                volume: content.volume
            });
        }, 1000);
    }

    /**
     * 
     * @param {HTMLElement} content 
     */
    handleEnded()
    {
        let content = this.getContentVideo();
        let contentTitle = this.getContentTitle();

        clearInterval(this.contentTime);

        contentTitle.removeAttribute('class');

        content.removeAttribute('class');
        content.removeEventListener('play', this.handleTimeUpdate);
        content.removeEventListener('ended', this.handleEnded);
        
        this.socket.emit('play:setEnded');
    }
}

export default Player;
