var express = require('express');
const { userModel } = require('../models');
var router = express.Router();

router.get('/', function(req, res, next) {
  isLogged = false;
  if (req.session.username) {
    isLogged = true;
  }
  res.render('index', { title: 'Dabloons4us', isLogged: isLogged });
});

module.exports = router;
