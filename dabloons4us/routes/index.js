var express = require('express');
const { userModel } = require('../models');
var router = express.Router();

router.get('/', function(req, res, next) {
  userModel.find({}, 'username dabloons lastRedeem').sort({ dabloons: -1 }).limit(25).then((result, err) => {
    res.render('index', { title: 'Dabloons4us', users: result });
  });
});

module.exports = router;
