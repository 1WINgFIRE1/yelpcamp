const ExpressError = require("./utils/ExpressError");
const {campgroundSchema,reviewSchema}=require("./schemas")
const Campground=require("./models/campground")
const Review = require("./models/review")


module.exports.isLoggedIn = (req,res,next)=>{
    
    if(!req.isAuthenticated())
    {
        req.session.returnTo = req.originalUrl
        req.flash("error", "You must Sign in!")
        return res.redirect("/login")
    }
    
    next()
}



// Server Side Validation of campground (Validation Middleware)
module.exports.validateCampground = (req,res,next)=>{
    
    const {error}= campgroundSchema.validate(req.body)

    if(error)
    {
        const msg= error.details.map(el => el.message).join(",");
        throw new ExpressError(msg,400)
    }
    else
    {
        next();
    }
}

module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id))
    {
        req.flash("error","You Dont Have Permission")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}


// Server side validation of review (Validation Middleware)
module.exports.validateReview = (req,res,next)=>{

    const {error} = reviewSchema.validate(req.body)
    if(error)
    {
        const msg= error.details.map(el => el.message).join(",");
        req.flash("error","Please Be Kind and Give Atleast One Rating!")
        res.redirect(`/campgrounds/${req.params.id}`)
    }
    else
    {
        next();
    }
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} = req.params
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id))
    {
        req.flash("error","You Dont Have Permission")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}