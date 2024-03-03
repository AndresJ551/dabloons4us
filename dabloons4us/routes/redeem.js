var express = require('express');
const { userModel } = require('../models');
var router  = express.Router();

router.get('/', function(req, res, next) {
  if (req.session.username) {
    isRedeemable = false;
    since = Date.now() - new Date(req.session.lastRedeem);
    if (since >= req.app.locals.redeemTimeout) {
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
      if( since>= req.app.locals.redeemTimeout) {
      dabloons = req.app.locals.redeemable_dabloons;
      userModel.updateOne({
        _id: req.session._id
      }, {
        $inc: { dabloons: dabloons },
        $set: { lastRedeem: Date.now() }
      }).then(() => {
        req.session.dabloons += dabloons;
        req.session.lastRedeem = Date.now();
        res.render('redeem', {
          title: 'Redeem Dabloons',
          dabloons: req.session.dabloons || 0,
          isLogged: true,
          error: 'Dabloons reddemed.'
        });
      }).catch((err) => {
        console.log(err);
      });
    } else {
      hours_left = parseInt((req.app.locals.redeemTimeout - since ) / (1000 * 60 * 60));
      res.render('redeem', {
        title: 'Redeem Dabloons',
        dabloons: req.session.dabloons || 0,
        isLogged: true,
        error: `Time until next redeem: ${hours_left} hrs.`
      });
    }
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
