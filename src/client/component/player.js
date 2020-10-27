import EventEmitter from 'events';
import seconds from 'hh-mm-ss';
import Prompt from './prompt.js';

class Player extends EventEmitter
{
    constructor(sockets)
    {
        super();

        this.sockets = sockets;
        this.socket = sockets.socket;

        this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
        this.handleEnded = this.handleEnded.bind(this);
        this.handlePlay = this.handlePlay.bind(this);
        this.handlePlayReset = this.handlePlayReset.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.handlePause = this.handlePause.bind(this);

        this.socketEvents(sockets.socket);
    }

    socketEvents(socket)
    {
        socket.on('play:getInteraction', () => {
            this.getInteraction();
        });

        socket.on('play:contentData', (data) => {
            this.data = data;
            this.updatePlayback(data);
        });

        socket.on('play:playerData', (data) => {
            this.data = data;
            this.updatePlayer();
        });

        socket.on('play:playerTime', (time, duration) => {
            this.updatePlayerTime(time, duration);
        });

        socket.on('play:contentPlay', () => {
            this.setPlaybackPlay();
        });

        socket.on('play:contentStop', () => {
            this.setPlaybackStop();
        });

        socket.on('play:contentPause', () => {
            this.setPlaybackPause();
        });

        socket.on('play:playerEnd', () => {
            this.updatePlayerEnded();
        });
    }

    getInteraction()
    {
        let prompt = new Prompt();

        prompt.open('Content playing is disabled until you interact with this window. Please click anywhere on this message to enable content playing. If this does not work, please refresh this window.');
    }

    getContentVideo()
    {
        return document.getElementById('content');
    }

    getContentTitle()
    {
        return document.getElementById('contenttitle');
    }

    getPlayer()
    {
        return document.getElementById('player');
    }

    newPlayer()
    {
        let player = document.createElement('div');

        player.setAttribute('id', 'player');
        player.setAttribute('class', 'Input width100 floatingBottom bgBlack textWhite');
        document.body.appendChild(player);

        return player;
    }

    updatePlayer()
    {
        let player = this.getPlayer() || this.newPlayer();
        let pipe = document.createElement('span');
        let button = document.createElement('span');
        let stop = document.createElement('span');
        let time = document.createElement('span');

        pipe.innerHTML = ' | ';

        button.innerHTML = 'Pause';
        button.setAttribute('id', 'playerbutton');
        button.addEventListener('click', this.handlePause);

        stop.innerHTML = 'Stop';
        stop.addEventListener('click', this.handleStop);

        time.setAttribute('id', 'playertime');

        player.innerHTML = '';
        player.appendChild(button);
        player.appendChild(pipe);
        player.appendChild(stop);
        player.appendChild(pipe.cloneNode(true));
        player.appendChild(time);
    }

    updatePlayerTime(currentTime, duration)
    {
        let timeTotal = seconds.fromS(Math.round(duration));
        let timeCurrent = seconds.fromS(Math.round(currentTime));
        let time = document.getElementById('playertime');

        time.innerHTML = `${timeCurrent} / ${timeTotal}`;
    }

    updatePlayerEnded()
    {
        let button = document.getElementById('playerbutton');

        button.innerHTML = 'Play';
        button.removeEventListener('click', this.handlePause);
        button.removeEventListener('click', this.handlePlay);
        button.addEventListener('click', this.handlePlayReset);
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

        this.socket.emit('play:playerData', this.sockets.origin, data);
    }

    setPlaybackPlay()
    {
        let content = this.getContentVideo();

        content.play();
    }

    setPlaybackStop()
    {
        let content = this.getContentVideo();

        content.pause();
        content.currentTime = 0;
        this.handleEnded();
    }

    setPlaybackPause()
    {
        let content = this.getContentVideo();

        content.pause();
    }

    handlePlay(event)
    {
        let button = event.target;

        button.innerHTML = 'Pause';
        button.removeEventListener('click', this.handlePlay);
        button.addEventListener('click', this.handlePause);

        this.socket.emit('play:contentPlay', this.sockets.target);
    }

    handlePlayReset()
    {
        this.socket.emit('play:contentData', this.sockets.target, this.data);
    }

    handleStop()
    {
        this.socket.emit('play:contentStop', this.sockets.target);
    }

    handlePause(event)
    {
       let button = event.target;

        button.innerHTML = 'Play'
        button.removeEventListener('click', this.handlePause);
        button.addEventListener('click', this.handlePlay);

        this.socket.emit('play:contentPause', this.sockets.target);
    }

    handleTimeUpdate()
    {
        let content = this.getContentVideo();

        this.contentTime = setInterval(() => {
            this.socket.emit('play:playerTime', this.sockets.origin, content.currentTime, content.duration || 0);
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
        
        this.socket.emit('play:playerEnd', this.sockets.origin);
    }
}

export default Player;
