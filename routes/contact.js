const router = require('express').Router();

router.get('/',(req,res) => {
    res.render('contact', {currentActive:"contact"});
});
router.post('/',(req,res) => {
    
});

module.exports = router;