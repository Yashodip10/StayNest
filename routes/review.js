const { isLoggedIn } = require("../middleware");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");

const validateReview = (req, res, next) => {

    let { error } = reviewSchema.validate(req.body);

    if (error) {

        let errMsg = error.details.map(el => el.message).join(",");

        throw new ExpressError(400, errMsg);

    }

    next();

};

router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(async (req, res) => {

        let listing = await Listing.findById(req.params.id);

        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        req.flash("success", "Review Added!");

        res.redirect(`/listings/${listing._id}`);

    })
);

module.exports = router;