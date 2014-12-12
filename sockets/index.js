module.exports = function(server) {
    var io = require('socket.io')(server);

    io.on('connection', function(socket) {
        // the primary socket at '/' 
    });

    var todos = require('./todos.ws.js')(io);
    return io;
}
