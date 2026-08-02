if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const multer = require("multer");
const { storage } = require("./cloudConfig");
const upload = multer({ storage });
const reviewRouter = require("./routes/review");
const bookingRouter = require("./routes/booking");
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate")
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema} = require("./schema.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const userRouter = require("./routes/user");
const { isLoggedIn, isOwner } = require("./middleware");
const wishlistRouter = require("./routes/wishlist");

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
app.use("/", userRouter);
const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};
app.use("/listings/:id/reviews", reviewRouter);
app.use("/bookings", bookingRouter);
app.use("/wishlist", wishlistRouter);


const dbUrl =
    process.env.ATLASDB_URL ||
    "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(dbUrl);
}

main().then(()=>{
    console.log("connection sucessfull..");
}).catch((err)=>{
    console.log(err)
}); 


app.get("/",(req,res)=>{
    res.send("welcome to home page");
})

// app.get("/testListing",async(req,res)=>{
//    const sampleTesing=new Listing({
//        title:"My new villa",
//        description:"sea face villa",
//        price:1200,
//        location:"goa",
//        country:"India",
//    });
//    await sampleTesing.save();
//    console.log("sample was saved")
//    res.send("Successful tested")
// });


// index route
app.get("/listings", wrapAsync(async (req, res) => {

    let search = req.query.search;

    let allListings;

    if (search) {

        allListings = await Listing.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        });

    } else {

        allListings = await Listing.find({});

    }

    res.render("listings/index", {
    allListings,
    search
});

}));


 // new routes
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})


// create routes
app.post(
    "/listings",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(async (req, res) => {

   const newListing = new Listing(req.body.listing);

// Convert image URL string into the object expected by the model
newListing.image = {
    url: req.file.path,
    filename: req.file.filename,
};
newListing.owner = req.user._id;

    await newListing.save();
    console.log(newListing);
         res.redirect("/listings");

    })
);

//Edite route
app.get(
    "/listings/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {

        let { id } = req.params;

const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    });

        res.render("listings/edit", { listing });

    })
);

//update route
app.put(
    "/listings/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(async (req, res) => {

        let { id } = req.params;

        await Listing.findByIdAndUpdate(id, {
            ...req.body.listing
        });

        res.redirect(`/listings/${id}`);

    })
);

//delete route
app.delete(
    "/listings/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {

        let { id } = req.params;

        await Listing.findByIdAndDelete(id);

        req.flash("success", "Listing Deleted!");

        res.redirect("/listings");

    })
);

//  show routes
app.get("/listings/:id", wrapAsync(async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        });

    res.render("listings/show.ejs", { listing });

}));

// Catch-all 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    console.log("========== ERROR ==========");
    console.error(err);
    console.log("===========================");

    res.status(err.statusCode || 500).send(err.stack);
});


app.listen(8080,()=>{
    console.log(" server is listening on port 8080:");
})
