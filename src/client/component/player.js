import EventEmitter from 'events';

class Player extends EventEmitter
{
    constructor(sockets)
    {
        super();

        this.sockets = sockets;
        this.socket = sockets.socket;

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

        content.pause();
        content.src = data.source.video;
        content.load();
        content.play();
    }   
}

export default Player;
