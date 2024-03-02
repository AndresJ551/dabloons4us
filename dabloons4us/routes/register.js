var express         = require('express');
var hash            = require('pbkdf2-password')()
const { userModel } = require('../models');
var router          = express.Router();

router.get('/', function(req, res, next) {
  if (req.session.username) {
    res.redirect('/');
  } else {
    res.render('register', { title: 'Register', error: '' });
  }
});


router.post('/', function(req, res, next) {
  if(req.body.username != "" && req.body.password != ""){
    username_low = req.body.username.toLowerCase();

    userModel.findOne({ username_low: username_low }).then((result, err) => {
      if (result) {
        res.render('register', { title: 'Register', error: 'User already exists.' });
      } else {
        username = req.body.username;
        hash({ password: req.body.password, salt: req.app.locals.salt }, function (err, pass, salt, hash) {
          if (err) throw err;
          password = hash
          // store the salt & hash in the db
          dabloons = req.app.locals.inital_dabloons;
          const user = new userModel({
            username,
            username_low,
            password,
            dabloons
          });
          const save = user.save().then((result, err)=>{
            req.session.regenerate(() => {
              req.session.username = req.body.username;
              req.session._id = result._id;
              req.session.dabloons = dabloons;
              req.session.createdAt = result.createdAt;
            });
          });
          res.redirect('/users');
        });
      }
    });
  } else {
    res.render('register', { title: 'Register', error: 'Empty fields.' });
  }
});

module.exports = router;
