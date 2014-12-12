var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});

// if needed, add other REST API end points here 
// router = require('./products.api')(router); 

module.exports = router;
