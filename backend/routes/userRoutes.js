const express = require('express');
const router = express.Router();
const { getUsers, registerUser, deactivateUser } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.use(restrictTo('SUPER_ADMIN'));

router.route('/')
    .get(getUsers)
    .post(registerUser);

router.patch('/:id/deactivate', deactivateUser);

module.exports = router;
