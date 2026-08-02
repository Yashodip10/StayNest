const { isLoggedIn } = require("../middleware");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");

// Validate Review
const validateReview = (req, res, next) => {

    let { error } = reviewSchema.validate(req.body);

    if (error) {

        let errMsg = error.details.map((el) => el.message).join(",");

        throw new ExpressError(400, errMsg);

    }

    next();

};

// Create Review
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(async (req, res) => {

        // Find the listing
        let listing = await Listing.findById(req.params.id);

        // Create a new review
        let newReview = new Review(req.body.review);

        // Set the logged-in user as the review author
        newReview.author = req.user._id;

        // Add review to listing
        listing.reviews.push(newReview);

        // Save review and listing
        await newReview.save();
        await listing.save();

        req.flash("success", "Review Added Successfully!");

        res.redirect(`/listings/${listing._id}`);

    })
);

// Delete Review
router.delete(
    "/:reviewId",
    isLoggedIn,
    wrapAsync(async (req, res) => {

        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId },
        });

        await Review.findByIdAndDelete(reviewId);

        req.flash("success", "Review Deleted!");

        res.redirect(`/listings/${id}`);

    })
);

module.exports = router;