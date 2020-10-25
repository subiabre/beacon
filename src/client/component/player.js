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
        socket.on('play:getData', (data) => {
            this.updatePlayer(data);
        });
    }
    
    updatePlayer(data)
    {
        let content = document.getElementById('content');
        let contentTitle = document.getElementById('contenttitle');
    
        contentTitle.innerHTML = data.title;
        
        content.pause();
        content.src = data.source.video;
        content.load();
        content.play();
    }   
}

export default Player;
