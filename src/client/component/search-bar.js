import api from '../service/api.js';
import EventEmitter from 'events';
import Prompt from './prompt.js';

class SearchBar extends EventEmitter
{
    constructor()
    {
        super();

        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);

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
    
        if (query.match(/(https)?(\:\/\/)?(www\.)?youtu(\.)?be(\.com)?\//)) {
            input.value = '';
            
            api.youtube(query, (data) => {
                if (data.status == 'error') {
                    let prompt = new Prompt();
                    prompt.open(data.error);
                } else {
                    this.emit('queue:getData', data);
                }
            });
        }
    
        return false;
    }
}

export default SearchBar
