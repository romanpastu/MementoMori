//Backend server

const portNumber = '1234'
const IPServer = 'localhost'


const urlBackend = "http://" + IPServer + ":" + portNumber;

/*prod url*/
//const urlBackend == "https://api.mementomori.io"

module.exports = {
    urlBackend: urlBackend
}
