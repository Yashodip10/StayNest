module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.flash("error", "You must be logged in!");

        return res.redirect("/login");
    }

    next();

};

const Listing = require("./models/listing");

module.exports.isOwner = async (req, res, next) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing.owner.equals(req.user._id)) {

        req.flash("error", "You don't have permission to do that!");

        return res.redirect(`/listings/${id}`);
    }

    next();

};