const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/signup", wrapAsync(async (req, res, next) => {

    const { username, email, password } = req.body;

    const newUser = new User({
        email,
        username
    });

    const registeredUser = await User.register(newUser, password);

    // Automatically login after successful signup
    req.login(registeredUser, (err) => {

        if (err) {
            return next(err);
        }

        req.flash("success", "Welcome to Wanderlust!");

        res.redirect("/listings");

    });

}));


router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success", "Welcome Back to Wanderlust!");
        res.redirect("/listings");
    }
);

router.get("/logout", (req, res, next) => {

    req.logout(function (err) {

        if (err) {
            return next(err);
        }

        req.flash("success", "You are logged out!");

        res.redirect("/listings");

    });

});

module.exports = router;