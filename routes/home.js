const router = require('express').Router();
const fileGenerator = require('../controllers/fileGenerator.js');
const mail = require('../controllers/mail.js');
const errorsList = require('../controllers/errorsList.js');
const { check, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  res.render('home', {
    currentActive: "home"
  });
});

router.get('/home', (req, res) => {
  res.render('home', {
    currentActive: "home"
  });
});

router.post('/prepare', async (req, res) => {
  let {
    base64Image,
    convertedText
  } = {
    ...req.body["data"][0],
    ...req.body["data"][1]
  };

  try {
    let paths = await fileGenerator.generate(base64Image, convertedText);
    res.send(JSON.stringify({
      paths,
      error: null
    }));
  } catch (err) {
    console.log(err)
    res.send(JSON.stringify({
      paths: null,
      error: true
    }));
  }
});

router.post('/mail', [
  check('name')
    .not().isEmpty().withMessage('Please fill out this field').bail()
    .trim()
    .isLength({ min: 3, max: 40 })
    .withMessage('Name is too short'),
  check('email')
    .not().isEmpty().withMessage('Please fill out this field').bail()
    .trim()
    .isEmail()
    .withMessage('Email type is invalid'),
  check('message')
  .not().isEmpty().withMessage('Please fill out this field').bail()
  .trim()
  .isLength({ min: 10, max: 1000 })
  .withMessage('Message is too short')
], (req, res) => {
  const errorFormatter = ({ msg, param}) => {
    return { inputName: param, reason: msg };
  };
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.send(JSON.stringify({
      formErrors:errors.array(),
      mailErrors:null,
      message: null
    }))
  } else {
    try {
      mail.send(req.body);
      return res.send(JSON.stringify({
        formErrors: null,
        mailErrors: null,
        message: errorsList.mailSuccess
      }))
    } catch (err) {
      if(err) {
        return res.send(JSON.stringify({
          formErrors: null,
          mailErrors: errorsList.network,
          message: null
        }))
      }
    }
  }

})

module.exports = router;



