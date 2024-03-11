var express = require('express');
const { userModel } = require('../models');
var router  = express.Router();
const mattermost    = require('../mattermost');

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
    if (req.body.amount && req.body.username != "" && req.body.amount != "") {
      username_low = req.body.username.toLowerCase();
      userModel.findOne({ username_low: username_low }).then((remote_user, err) => {
        if (remote_user) {
          userModel.findById(req.session._id, 'dabloons').then((result, err) => {
            if (result) {
              dabloons = parseInt(req.body.amount);
              if (result.dabloons >= dabloons) {
                userModel.updateOne({ _id: remote_user._id }, { $inc: { dabloons: dabloons } }).then(() => {
                  userModel.updateOne({ _id: req.session._id }, { $inc: { dabloons: dabloons * -1 } }).then(() => {
                    redisSessions(req, req.session._id, remote_user._id, dabloons);
                    res.render('transfer', {
                      title: 'Transfer Dabloons',
                      dabloons: req.session.dabloons - dabloons,
                      isLogged: true,
                      error: 'Dabloons sent.'
                    });
                    mattermost(`User ${req.session.username} transfered ${dabloons} Dabloons to ${req.body.username}.`);
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
                  isLogged: true,
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
            isLogged: true,
            error: 'Non existing username.'
          });
        }
      });
    } else {
      res.render('transfer', {
        title: 'Transfer Dabloons',
        dabloons: req.session.dabloons || 0,
        isLogged: true,
        error: 'Empty fields.'
      });
    }
  } else {
    res.status(err.status || 402);
    res.render('error');
  }
});

async function redisSessions(req, local, remote , dabloons) {
  for await(const key of req.app.locals.redis.scanIterator()) {
    /*
    {
      'cookie':{
        'originalMaxAge':2592000000,
        'expires':'2024-04-02T22:46:51.188Z',
        'httpOnly':true,
        'path':'/'
      },
      'username':'hinobara',
      '_id':'65e3e0d032f1ed0696b25aef',
      'dabloons':70,
      'createdAt':'2024-03-03T02:30:40.597Z',
      'lastRedeem':'2024-03-03T21:52:07.270Z'
    }
    */
    sessionData   = req.app.locals.redis.get(await key);
    sessionObject = JSON.parse(await sessionData);
    if (sessionObject.username) {
      if ( sessionObject._id == local) {
        sessionObject.dabloons -= dabloons;
        sessionNew = JSON.stringify(sessionObject);
        req.app.locals.redis.set(key, sessionNew);
      } else if (sessionObject._id == remote) {
        sessionObject.dabloons += dabloons;
        sessionNew = JSON.stringify(sessionObject);
        req.app.locals.redis.set(key, sessionNew);
      }
    }
  }
}

module.exports = router;
