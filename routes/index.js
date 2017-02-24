'use strict';

let express = require('express');
let router = express.Router();
let path = require('path');

const options = {
    root: __dirname + '../public/',
};

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile("index.html", options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', "index.html");
        }
    });
});

module.exports = router;
