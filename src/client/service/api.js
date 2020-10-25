/**
 * Makes an API call to the specified endpoint at the beacon server
 * @param {String} endpoint 
 * @param {Closure} callback 
 */
const fetch = (endpoint, callback) =>
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

const youtube = (video, callback) => 
{
    fetch('/youtube/data/' + video, callback);
}

export default {
    fetch,
    youtube
};
