class Prompt
{
    constructor()
    {
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
    }

    open(message)
    {
        let prompt = document.createElement('div');
        let body = document.body;

        prompt.setAttribute('class', 'Window bgBlackLight shadowBlack textWhite width50');
        prompt.addEventListener('click', this.close);
        prompt.innerHTML = message;

        body.appendChild(prompt);
    }

    close(event)
    {
        let prompt = event.target;
        let body = document.body;

        body.removeChild(prompt);
    }
}

export default Prompt;
