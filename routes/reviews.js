const express = require('express');
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const catchAsync = require('../utils/catchAsync');

const Review = require('../models/review');
const Campground = require('../models/campground');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview)); //DELETES THE REVIEWS. THE PULL METHOD FROM MONGO ALLOWS YOU TO FIND THE REVIEW INSTANCES WITHIN THE CAMPGROUND THAT CORELATES TO THE REVIEW BEING DELETED AND WILL DELETE THAT FROM THE ARRAY.

module.exports = router;
