import EventEmitter from 'events';
import seconds from 'hh-mm-ss';

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
        this.handlePause = this.handlePause.bind(this);

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

        socket.on('play:getContent', (time, duration, volume) => {
            this.updatePlayer(time, duration, volume);
        });

        socket.on('play:getTime', (time, duration) => {
            this.updatePlayerTime(time, duration);
        });

        socket.on('play:getPlay', () => {
            this.setPlaybackPlay();
        });

        socket.on('play:getPause', () => {
            this.setPlaybackPause();
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

    updatePlayer(volume)
    {
        let player = this.getPlayer() || this.newPlayer();
        let button = document.createElement('span');
        let time = document.createElement('span');

        button.innerHTML = 'Pause';
        button.addEventListener('click', this.handlePause);

        time.setAttribute('id', 'playertime');

        player.innerHTML = '';
        player.appendChild(button);
        player.appendChild(time);
    }

    updatePlayerTime(currentTime, duration)
    {
        let timeTotal = seconds.fromS(Math.round(duration));
        let timeCurrent = seconds.fromS(Math.round(currentTime));
        let time = document.getElementById('playertime');

        time.innerHTML = `${timeCurrent} / ${timeTotal}`;
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
        
        this.socket.emit('play:setContent', content.volume);
    }

    setPlaybackData(data)
    {
        let content = this.getContentVideo();

        content.currentTime = data.currentTime;
        content.volume = data.volume;
    }

    setPlaybackPlay()
    {
        let content = this.getContentVideo();

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

        this.socket.emit('play:setPlay');
    }

    handlePause(event)
    {
       let button = event.target;

        button.innerHTML = 'Play'
        button.removeEventListener('click', this.handlePause);
        button.addEventListener('click', this.handlePlay);

        this.socket.emit('play:setPause');
    }

    handleTimeUpdate()
    {
        let content = this.getContentVideo();

        this.contentTime = setInterval(() => {
            this.socket.emit('play:setTime', content.currentTime, content.duration || 0);
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
