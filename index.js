

const url = require("url");
const app = require("./app");
const http = require("http").createServer(app);
let log = require('./libs/log')(module);
let io = require('./socket');
io.Socket(http);
io.start();
http.listen(app.get("port"), () => {
    log.info("Express server listenned on a port" + app.get("port"));
});

