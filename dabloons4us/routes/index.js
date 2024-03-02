var express = require('express');
const { userModel } = require('../models');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  userModel.find({}).then((result, err) => {
    res.render('index', { title: 'Dabloons4us', users: result });
  });
});

module.exports = router;
