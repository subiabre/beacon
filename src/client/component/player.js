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
        this.handleMoveTime = this.handleMoveTime.bind(this);

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

        socket.on('play:playerTime', (time) => {
            this.updatePlayerTime(time);
        });

        socket.on('play:playerDuration', (duration) => {
            this.updatePlayerDuration(duration);
        });

        socket.on('play:contentPlay', () => {
            this.setPlaybackPlay();
        });

        socket.on('play:contentStop', () => {
            this.setPlaybackStop();
        });

        socket.on('play:contentTime', (time) => {
            this.setPlaybackTime(time);
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
        
        let bar = document.createElement('div');
        let progressBar = document.createElement('div');

        pipe.innerHTML = ' | ';

        button.innerHTML = 'Pause';
        button.setAttribute('id', 'playerbutton');
        button.addEventListener('click', this.handlePause);

        stop.innerHTML = 'Stop';
        stop.addEventListener('click', this.handleStop);

        time.setAttribute('id', 'playertime');

        progressBar.setAttribute('class', 'bgWhiteGrey height5 borderRight');

        bar.setAttribute('id', 'playerbar');
        bar.setAttribute('class', 'bgBlackLight height5');
        bar.addEventListener('click', this.handleMoveTime);
        bar.appendChild(progressBar);

        player.innerHTML = '';
        player.appendChild(button);
        player.appendChild(pipe);
        player.appendChild(stop);
        player.appendChild(pipe.cloneNode(true));
        player.appendChild(time);
        player.appendChild(pipe.cloneNode(true));
        player.appendChild(bar);
    }

    updatePlayerDuration(duration)
    {
        this.contentDuration = duration;
    }

    updatePlayerTime(currentTime)
    {
        let timeTotal = seconds.fromS(Math.round(this.contentDuration || 0));
        let timeCurrent = seconds.fromS(Math.round(currentTime));
        let time = document.getElementById('playertime');
        let bar = document.getElementById('playerbar');

        time.innerHTML = `${timeCurrent} / ${timeTotal}`;
        bar.firstChild.style.width = parseInt(currentTime * bar.offsetWidth / this.contentDuration) + 'px';
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
        content.addEventListener('loadeddata', this.handleTimeUpdate);
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

    setPlaybackTime(time)
    {
        let content = this.getContentVideo();

        content.pause();
        content.currentTime = time;
        content.play();
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

    handleMoveTime(event)
    {
        let bar = document.getElementById('playerbar');
        let mouseX = event.pageX - bar.offsetLeft;
        let time = mouseX * this.contentDuration / bar.offsetWidth;

        bar.firstChild.style.widht = mouseX + 'px';

        this.socket.emit('play:contentTime', this.sockets.target, time);
    }

    handleTimeUpdate()
    {
        let content = this.getContentVideo();

        this.contentTimeInterval = setInterval(() => {
            this.socket.emit('play:playerTime', this.sockets.origin, content.currentTime);
        }, 1000);

        this.socket.emit('play:playerDuration', this.sockets.origin, content.duration);
        console.log(content.duration);
    }

    /**
     * 
     * @param {HTMLElement} content 
     */
    handleEnded()
    {
        let content = this.getContentVideo();
        let contentTitle = this.getContentTitle();

        clearInterval(this.contentTimeInterval);

        contentTitle.removeAttribute('class');

        content.removeAttribute('class');
        content.removeEventListener('play', this.handleTimeUpdate);
        content.removeEventListener('ended', this.handleEnded);
        
        this.socket.emit('play:playerEnd', this.sockets.origin);
    }
}

export default Player;
