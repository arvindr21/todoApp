var todosDB = require('./todos.db');
module.exports = function(io) {

    var todos = io.of('/todos');

    todos.on('connection', function(socket) {

        socket.on('getAllTodos', function() {
            dispatchAll(socket);
        });

        socket.on('saveTodo', function(todo) {
            todosDB.saveTodo(todo, function(err, data) {
                if (err) throw err; // You can emit the error to a socket   
                dispatchAll(socket);
            });
        });

        socket.on('updateTodo', function(data) {
            todosDB.updateTodo(data, function(err, data) {
                if (err) throw err; // You can emit the error to a socket 
                dispatchAll(socket);
            });
        });

        socket.on('deleteTodo', function(data) {
            todosDB.deleteTodo(data.id, function(err, data) {
                if (err) throw err; // You can emit the error to a socket 
                dispatchAll(socket);
            });
        });

        // On connection send all the todos, to save one round trip
        dispatchAll(socket);
    });


    function dispatchAll(socket) {
        todosDB.getAllTodos(function(err, data) {
            if (err) throw err; // You can emit the error to a socket 
            io.of('/todos').emit('allTodos', data);
        });
    }

    return todos;
}
