import api from '../service/api.js';
import EventEmitter from 'events';
import Prompt from './prompt.js';

class SearchBar extends EventEmitter
{
    constructor()
    {
        super();

        this.getEventTargetRecursive = this.getEventTargetRecursive.bind(this);
        this.hideYoutubeResults = this.hideYoutubeResults.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSelectVideo = this.handleSelectVideo.bind(this);

        this.subscribeToSearchBar();
    }

    subscribeToSearchBar()
    {
        let form = document.getElementById('searchbar');

        form.addEventListener('submit', this.handleSearchSubmit);
    }

    handleSearchSubmit(event)
    {
        let input = document.getElementById('searchinput');
        let query = input.value;

        event.preventDefault();

        input.value = '';
        
        if (query.match(/(https)?(\:\/\/)?(www\.)?youtu(\.)?be(\.com)?\//)) {    
            api.youtube(query, (data) => {
                if (data.status == 'error') {
                    let prompt = new Prompt();
                    prompt.open(data.error);
                } else {
                    this.emit('queue:getData', data);
                }
            });

            return false;
        }

        api.youtubeSearch(query, (data) => {
            if (data.status == 'error') {
                let prompt = new Prompt();
                prompt.open(data.error);
            } else {
                console.log(data.results);
                this.showYoutubeResults(data.results);
            }

            return false;
        });
    }

    showYoutubeResults(results)
    {
        let screen = document.createElement('div');

        screen.setAttribute('id', 'youtuberesults');
        screen.setAttribute('class', 'Screen screenContent75 bgBlack75 textWhite scrollVertical');
        screen.addEventListener('click', this.hideYoutubeResults);

        document.body.appendChild(screen);

        results.map(result => {
            let item = document.createElement('div');
            let subm = document.createElement('div');
            let image = document.createElement('img');
            let title = document.createElement('span');

            image.setAttribute('class', 'centerVertical padding');
            image.src = result.thumbnails.medium.url;
 
            title.innerHTML = result.title;

            subm.appendChild(image);
            subm.appendChild(title);

            item.setAttribute('id', 'youtube' + result.id);
            item.setAttribute('youtubelink', result.link);
            item.setAttribute('class', 'hoverBlackLight padding');
            item.appendChild(subm);

            screen.appendChild(item.cloneNode(true));
        });

        results.map(result => {
            let appended = document.getElementById('youtube' + result.id);
            appended.addEventListener('click', this.handleSelectVideo);
        })
    }

    hideYoutubeResults(event)
    {
        let screen = document.getElementById('youtuberesults');

        document.body.removeChild(screen);
    }

    getEventTargetRecursive(attribute, element)
    {
        let isCurrent = element.getAttribute(attribute);

        if (isCurrent) return element;

        return this.getEventTargetRecursive(attribute, element.parentNode);
    }

    handleSelectVideo(event)
    {
        let item = this.getEventTargetRecursive('youtubelink', event.target);
        let url = item.getAttribute('youtubelink');

        api.youtube(url, (data) => {
            if (data.status == 'error') {
                let prompt = new Prompt();
                prompt.open(data.error);
            } else {
                this.emit('queue:getData', data);
                return false;
            }
        });
    }
}

export default SearchBar
