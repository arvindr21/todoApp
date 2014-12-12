(function(global) {
    // Local global var
    var _global = {};

    function DataManager(options) {
        this.connection = options.connection;
        _global.collections = this.collections = options.collections;
        _global.isConnectionAlive = false;
        _global.connectCB = this.connectCB = options.connectCB;
        this.init();
    }

    DataManager.prototype.init = function() {
        var self = _global = this;
        var cs = self.collSockets = {}; // collection sockets objects

        // Init a new socket
        var s = self.Socket = io(self.connection);

        s.on('connect', self._connect);
        s.on('disconnect', self._disconnect);
        s.on('reconnect_attempt', self._reconnectAttempt);
        s.on('reconnect', self._reconnect);
        s.on('reconnect_error', self._reconnectError);
        s.on('reconnect_failed', self._reconnectFailed);

        // "Sub-Socket" for each collection
        var c = self.collections;
        c.forEach(function(coll) {
            var name = coll.name;
            var _s = io(self.connection + '/' + name);
            Object.keys(coll.subscribers).forEach(function(mthd) {
                _s.on(mthd, coll.subscribers[mthd]);
            });
            cs[name] = _s;
        });

        return self;
    };

    DataManager.prototype.pubData = function(collection, endpoint, data, callback) {
        var self = this;

        if (_global.isConnectionAlive) {
            self.collSockets[collection].emit(endpoint, data);
        } else {
            saveToLocalStorage(collection, {
                "endpoint": endpoint,
                "data": data
            });
        }
        callback(!_global.isConnectionAlive);
    };

    DataManager.prototype._connect = function() {
        _global.isConnectionAlive = true;
        // sync the localstorage
        var c = _global.collections;
        c.forEach(function(coll) {
            var localData = getFromLocalStorage(coll.name);
            if (localData) {
                localData.forEach(function(data) {
                    _global.collSockets[coll.name].emit(data.endpoint, data.data);
                });
            }
            clearCollection(coll.name);
        });

        _global.connectCB();
    };

    DataManager.prototype._disconnect = function() {
        _global.isConnectionAlive = false;
    };
    DataManager.prototype._reconnectAttempt = function() {
        _global.isConnectionAlive = false;
    };
    DataManager.prototype._reconnect = function() {
        _global.isConnectionAlive = false;
    };
    DataManager.prototype._reconnectError = function() {
        _global.isConnectionAlive = false;
    };
    DataManager.prototype._reconnectFailed = function() {
        _global.isConnectionAlive = false;
    };

    function saveToLocalStorage(collection, data) {
        var savedData = getFromLocalStorage(collection);
        var ls = savedData || [];
        ls.push(data);
        localStorage.setItem(collection, JSON.stringify(ls));
    }

    function clearCollection(collection) {
        localStorage.setItem(collection, null);
    }

    function getFromLocalStorage(collection) {
        return JSON.parse(localStorage.getItem(collection));
    }

    global.DataManager = DataManager;

})(this);
