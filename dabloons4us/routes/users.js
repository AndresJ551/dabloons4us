var express         = require('express');
const { userModel } = require('../models');
var router          = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.session.username) {
    userModel.find({}, 'username dabloons').sort({ dabloons: -1 }).limit(25).then((result, err) => {
      res.render('users', { title: 'Users', users: result, isLogged: true});
    });
  } else {
    console.log('Access denied to Users.')
    res.redirect('/login');
  }
});

module.exports = router;
