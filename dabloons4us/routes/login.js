var express         = require('express');
var hash            = require('pbkdf2-password')()
const { userModel } = require('../models');
var router          = express.Router();
const mattermost    = require('../mattermost');

router.get('/', function(req, res, next) {
  if (req.session.username) {
    res.redirect('/users');
  } else {
    res.render('login', { title: 'Login', isLogged: false, error: '' });
  }
});

router.post('/', function(req, res, next) {
  if (
    req.body.username &&
    req.body.password &&
    req.body.username != "" &&
    req.body.password != "" ){
    hash({ password: req.body.password, salt: req.app.locals.salt }, function (err, pass, salt, hash) {
      if (err) throw err;
      username_low = req.body.username.toLowerCase();
      userModel.findOne({ username_low: username_low, password: hash }).then((result, err) => {
        if (result) {
          req.session.username   = req.body.username;
          req.session._id        = result._id;
          req.session.dabloons   = result.dabloons;
          req.session.createdAt  = result.createdAt;
          req.session.lastRedeem = result.lastRedeem;
          res.redirect('/bank');
          mattermost(`New login: ${req.body.username}`);
        } else {
          res.render('login', { title: 'Login', isLogged: false, error: 'Incorrect credentials.' });
        }
      });
    });
  } else {
    res.render('login', { title: 'Login', isLogged: false, error: 'Empty fields.' });
  }
});

module.exports = router;
