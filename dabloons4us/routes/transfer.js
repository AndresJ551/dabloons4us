var express = require('express');
const { userModel } = require('../models');
var router  = express.Router();

router.get('/', function(req, res, next) {
  if (req.session.username) {
    res.render('transfer', {
      title: 'Transfer Dabloons',
      dabloons: req.session.dabloons || 0,
      isLogged: true,
      error: ''
    });
  } else {
    console.log('Access denied to Transfer.')
    res.redirect('/login');
  }
});


router.post('/', function(req, res, next) {
  if (req.session.username){
    if (req.body.username != "" && req.body.amount != "") {
      username_low = req.body.username.toLowerCase();
      userModel.findOne({ username_low: username_low }).then((remote_user, err) => {
        if (remote_user) {
          userModel.findById(req.session._id, 'dabloons').then((result, err) => {
            if (result) {
              dabloons = parseInt(req.body.amount);
              if (result.dabloons >= dabloons) {
                userModel.updateOne({ _id: remote_user._id }, { $inc: { dabloons: dabloons } }).then(() => {
                  userModel.updateOne({ _id: req.session._id }, { $inc: { dabloons: dabloons * -1 } }).then(() => {
                    req.session.dabloons -= dabloons;
                    res.render('transfer', {
                      title: 'Transfer Dabloons',
                      dabloons: req.session.dabloons || 0,
                      error: 'Dabloons sent.'
                    });
                  }).catch((err) => {
                    console.log(err);
                  });
                }).catch((err) => {
                  console.log(err);
                });
              } else {
                res.render('transfer', {
                  title: 'Transfer Dabloons',
                  dabloons: req.session.dabloons || 0,
                  error: 'Not enough Dabloons.'
                });
              }
            } else {
              res.redirect('/login');
            }
          });
        } else {
          res.render('transfer', {
            title: 'Transfer Dabloons',
            dabloons: req.session.dabloons || 0,
            error: 'Non existing username.'
          });
        }
      });
    } else {
      res.render('transfer', {
        title: 'Transfer Dabloons',
        dabloons: req.session.dabloons || 0,
        error: 'Empty fields.'
      });
    }
  } else {
    res.status(err.status || 402);
    res.render('error');
  }
});

module.exports = router;
