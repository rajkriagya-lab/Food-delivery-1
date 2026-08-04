const express = require('express');
const router = express.Router();
const { getAllOffers, toggleSaveCoupon, applyCoupon } = require('../controllers/coupon.controller.js');
const verifyToken = require('../middleware/auth.middleware.js'); 

router.get('/all', getAllOffers);
router.post('/save', verifyToken, toggleSaveCoupon);
router.post('/apply', verifyToken, applyCoupon);

app.use('/api/offers', router);