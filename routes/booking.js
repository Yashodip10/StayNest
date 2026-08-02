const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

// Create Booking
router.post(
    "/:id",
    isLoggedIn,
    wrapAsync(async (req, res) => {
        console.log("Booking route reached");

        const listing = await Listing.findById(req.params.id);

        const booking = new Booking({
            listing: listing._id,
            user: req.user._id,
        });

        await booking.save();

        req.flash("success", "Booking Confirmed!");

        res.redirect(`/listings/${listing._id}`);
    })
);

// Show all bookings of current user

router.get(
    "/",
    isLoggedIn,
    wrapAsync(async (req, res) => {

        const bookings = await Booking.find({
            user: req.user._id
        }).populate("listing");

        res.render("bookings/index", {
            bookings
        });

    })
);

// Cancel Booking

router.delete(
    "/:id",
    isLoggedIn,
    wrapAsync(async (req, res) => {

        await Booking.findByIdAndDelete(req.params.id);

        req.flash("success", "Booking Cancelled!");

        res.redirect("/bookings");

    })
);
module.exports = router;