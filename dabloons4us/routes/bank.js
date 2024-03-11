var express = require('express');
const { userModel } = require('../models');
var router  = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.session.username) {
    res.render('bank', {
      title: 'Dabloons Bank',
      dabloons: req.session.dabloons,
      isLogged: true
    });
  } else {
    console.log('Access denied to Bank.')
    res.redirect('/login');
  }
});

module.exports = router;
