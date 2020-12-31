const router = require('express').Router({ mergeParams: true });

router.use('/', require('./home.js'));
router.use('/contact', require('./contact.js'));

module.exports = router;