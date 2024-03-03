var express = require('express');
const { userModel } = require('../models');
var router  = express.Router();

router.get('/', function(req, res, next) {
  if (req.session.username) {
    res.render('redeem', {
      title: 'Redeem Dabloons',
      dabloons: req.session.dabloons || 0,
      error: ''
    });
  } else {
    console.log('Access denied to Redeem.')
    res.redirect('/login');
  }
});


router.post('/', function(req, res, next) {
  since = Date.now() - req.session.lastRedeem;
  if (req.session.username && since >= 86400000) {
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
        error: 'Dabloons reddemed.'
      });
    }).catch((err) => {
      console.log(err);
    });
  } else {
    hours_left = parseInt((86400000 - since ) / (1000 * 60 * 60), 10);
    res.render('redeem', {
      title: 'Redeem Dabloons',
      dabloons: req.session.dabloons || 0,
      error: `Time until next redeem: ${hours_left} hrs.`
    });
  }
});

module.exports = router;
