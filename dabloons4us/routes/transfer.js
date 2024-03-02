var express = require('express');
const { userModel } = require('../models');
var router  = express.Router();

router.get('/', function(req, res, next) {
  /*
  console.log(req.session);
  if (req.session.username) {
    res.send(req.session.username);
  } else {
    console.log('Access denied to Users.')
    res.redirect('/login');
  }
  */
  res.render('transfer', {
    title: 'Transfer Dabloons',
    dabloons: req.session.dabloons || 0,
    error: ''
  });
});


router.post('/', function(req, res, next) {
  if(req.body.username != "" && req.body.amount != ""){
    username_low = req.body.username.toLowerCase();

    userModel.findOne({ username_low: username_low }).then((remote_user, err) => {
      if(remote_user) {
        //userModel.findById()
        userModel.findOne({ username_low: 'andres' }).then((result, err) => {
          if(result) {
            dabloons = parseInt(req.body.amount);
            if(result.dabloons >= dabloons) {
              userModel.updateOne({ _id: remote_user._id }, { $inc: { dabloons: dabloons } }).then(() => {
                userModel.updateOne({ _id: '65e395c25e94fcf922c31c08' }, { $inc: { dabloons: dabloons * -1 } }).then(() => {
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
});

module.exports = router;
