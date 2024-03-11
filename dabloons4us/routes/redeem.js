var express = require('express');
const { userModel } = require('../models');
var router  = express.Router();
const mattermost    = require('../mattermost');

router.get('/', function(req, res, next) {
  if (req.session.username) {
    if (!req.session.lastRedeem) {
      req.session.lastRedeem = 0;
    }
    isRedeemable = false;
    since = Date.now() - new Date(req.session.lastRedeem);
    if ( since >= req.app.locals.redeem_timeout ) {
      isRedeemable = true;
    }
    res.render('redeem', {
      title: 'Redeem Dabloons',
      dabloons: req.session.dabloons || 0,
      isRedeemable: isRedeemable,
      isLogged: true,
      error: ''
    });
  } else {
    console.log('Access denied to Redeem.')
    res.redirect('/login');
  }
});


router.post('/', function(req, res, next) {
  if (!req.session.lastRedeem) {
    req.session.lastRedeem = 0;
  }
  since = Date.now() - new Date(req.session.lastRedeem);
  if (req.session.username){
    if ( since>= req.app.locals.redeem_timeout) {
      dabloons = req.app.locals.redeemable_dabloons;
      userModel.updateOne({
        _id: req.session._id
      }, {
        $inc: { dabloons: dabloons },
        $set: { lastRedeem: Date.now() }
      }).then((data, err) => {
        redisSessions(req);
        res.render('redeem', {
          title: 'Redeem Dabloons',
          dabloons: req.session.dabloons + dabloons,
          isRedeemable: false,
          isLogged: true,
          error: 'Dabloons redeemed.'
        });
        mattermost(`${req.app.locals.redeemable_dabloons} Dabloons redeemed by: ${req.session.username}.`);
      }).catch((err) => {
        console.log(err);
      });
    } else {
      var diff_as_date = new Date(req.app.locals.redeem_timeout - since);
      res.render('redeem', {
        title: 'Redeem Dabloons',
        dabloons: req.session.dabloons || 0,
        isLogged: true,
        isRedeemable: false,
        error: `Time until next redeem: ${diff_as_date.getHours()} hrs ${diff_as_date.getMinutes()} min.`
      });
    }
  } else {
    res.redirect('/login');
  }
});

async function redisSessions(req) {
  for await(const key of req.app.locals.redis.scanIterator()) {
    sessionData   = req.app.locals.redis.get(await key);
    sessionObject = JSON.parse(await sessionData);
    if (sessionObject.username) {
      if ( sessionObject._id == req.session._id ) {
        sessionObject.lastRedeem = Date.now();
        sessionObject.dabloons += req.app.locals.redeemable_dabloons;
        sessionNew = JSON.stringify(sessionObject);
        req.app.locals.redis.set(key, sessionNew);
      }
    }
  }
}

module.exports = router;
