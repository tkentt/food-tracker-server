const express = require('express');
const passport = require('passport');

const router = express.Router();

const Diary = require('../models/diary-model');
const { validateDate } = require('../utils/validate');

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  const filter = { userId };
  return Diary.find(filter)
    .then(results => res.json(results.map(result => result.serialize())))
    .catch(err => next(err));
});

router.get('/:yyyymmdd', validateDate, (req, res, next) => {
  const userId = req.user.id;
  const { yyyymmdd } = req.params;
  const filter = { userId, yyyymmdd };
  const newDiary = { yyyymmdd, userId };

  return Diary.findOne(filter)
    .then(result => {
      if (result) {
        return res.json(result.serialize());
      } else {
        return Diary.create(newDiary)
          .then(result => {
            if (result) {
              res.json(result.serialize());
            } else {
              next();
            }
          });
      }
    })
    .catch(err => next(err));
});

/* ========== /UPDATE A SINGLE ITEM ========== */
router.patch('/:yyyymmdd', validateDate, (req, res, next) => {
  const { yyyymmdd } = req.params;
  const userId = req.user.id;
  let { entries = [] } = req.body;

  return Diary.findOneAndUpdate(
    { yyyymmdd, userId },
    { $set: { entries } },
    { new:true }
  )
    .then(result => res.json(result.populate().serialize()))
    .catch(err => next(err));
});

module.exports = router;