const express = require("express");
const app = express()
const path= require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")

const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")

var methodOverride = require('method-override')
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");


const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes  = require("./routes/reviews")
const usersRoutes  = require("./routes/users")

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL

//Use dbUrl when  you want to use MongoDB server Database 
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const db= mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"))
db.once("open",()=>{
    console.log("Databse connected");
});


app.set("view engine","ejs" )
app.set("views", path.join(__dirname,"views"))


app.engine("ejs",ejsMate)


app.use(express.static(path.join(__dirname,"public")));
app.use(methodOverride('_method'))
//to parse the post request
app.use(express.urlencoded({extended:true}))

app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                childSrc: ["blob:"],
                objectSrc: ["'none'"],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, // Your Cloudinary account
                    "https://images.unsplash.com",
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
            },
        },
        crossOriginResourcePolicy: { policy: "same-origin" }, // Optional: Ensures better security for cross-origin resource sharing
    })
);

const secret = process.env.SECRET;

const sessionConfig = {
    store: MongoStore.create({
         mongoUrl: 'mongodb://127.0.0.1:27017/yelp-camp',
         touchAfter: 24 * 60 * 60
    }),
    secret,
    // secure: true,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

//must be use after sessionConfig
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



//req.User store the deserialize data of user whenever 
//you login/register (Provided by passport)
// !["/login","/"].includes(req.session.returnTo) &&

app.use((req,res,next)=>{
    res.locals.returnTo = req.session.returnTo;
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})






app.use("/",usersRoutes)
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/reviews",reviewRoutes)
 
app.get("/",(req,res)=>{
    res.render("home")
});



//route redirect if no above route match
app.all("*",(req,res,next)=>{
    next(new ExpressError("page not found",404))
})

app.use((err,req,res,next)=>{
    const {status = 500}=err;
    if(!err.message)
    {
        err.message="Something went wrong";
    } 
    res.status(status).render("error",{err})

})


app.listen(3000, ()=>{
    console.log("open 3000")
})