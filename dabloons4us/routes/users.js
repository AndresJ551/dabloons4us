var express = require('express');
const { userModel } = require('../models');
var router  = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.session);
  if (req.session.username) {
    res.send(req.session.username);
  } else {
    console.log('Access denied to Users.')
    res.redirect('/login');
  }
});

module.exports = router;
