const express = require("express");
const router = express.Router();

const Wishlist = require("../models/wishlist");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

// Save Listing
router.post(
    "/:id",
    isLoggedIn,
    wrapAsync(async (req, res) => {

        const listing = await Listing.findById(req.params.id);

        const alreadySaved = await Wishlist.findOne({
            user: req.user._id,
            listing: listing._id,
        });

        if (!alreadySaved) {

            const wishlist = new Wishlist({
                user: req.user._id,
                listing: listing._id,
            });

            await wishlist.save();

            req.flash("success", "Added to Wishlist!");

        } else {

            req.flash("error", "Already in Wishlist!");

        }

        res.redirect(`/listings/${listing._id}`);

    })
);

// My Wishlist
router.get(
    "/",
    isLoggedIn,
    wrapAsync(async (req, res) => {

        const wishlists = await Wishlist.find({
            user: req.user._id,
        }).populate("listing");

        res.render("wishlist/index", {
            wishlists,
        });

    })
);

// Remove Wishlist
router.delete(
    "/:id",
    isLoggedIn,
    wrapAsync(async (req, res) => {

        await Wishlist.findByIdAndDelete(req.params.id);

        req.flash("success", "Removed from Wishlist!");

        res.redirect("/wishlist");

    })
);

module.exports = router;