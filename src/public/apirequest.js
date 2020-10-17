/**
 * Wrapper to make easy XMLHttpRequests to the local API
 */
class ApiRequest
{
    /**
     * Makes an API call to the specified endpoint at the beacon server
     * @param {String} endpoint 
     * @param {Closure} callback 
     */
    fetchAPI(endpoint, callback)
    {
        let req = new XMLHttpRequest();
        
        req.addEventListener('load', (event) => {
            let req = event.target;
            let res = JSON.parse(req.responseText);

            callback(res);
        });

        req.open('GET', '/api' + endpoint);
        req.send();
    }

    youtube(video, callback)
    {
        this.fetchAPI('/youtube/data/' + video, callback);
    }
}

export default ApiRequest;
