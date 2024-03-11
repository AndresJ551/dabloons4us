var express = require('express');
var router = express.Router();
const mattermost    = require('../mattermost');

router.get('/', function(req, res, next) {
  mattermost(`User logout: ${req.session.username}`);
  req.session.destroy(() => {
    res.redirect('/');
  });
});


module.exports = router;
