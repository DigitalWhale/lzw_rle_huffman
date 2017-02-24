

const url = require("url");
const app = require("./app");
const http = require("http").createServer(app);;
let log = require('./libs/log')(module);
let io = require('socket.io')(http);
io.on('connection', (client) => {
    client.on('eventServer',  (data) => {
        console.log(data);
        client.emit('eventClient', { data: 'Connected' });
    });
    client.on('disconnect', ()=> {
        console.log('user disconnected');
    });
});
http.listen(app.get("port"), () => {
    log.info("Express server listenned on a port" + app.get("port"));
});

