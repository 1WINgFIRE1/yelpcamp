const Campground=require("../models/campground")
const {cloudinary} = require("../cloudinary")

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = (async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index",{campgrounds})
})

module.exports.renderNewForm = (req,res)=>{
    res.render("campgrounds/new")
}

module.exports.createCampground = async(req,res)=>{

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images= req.files.map(f =>({url:f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save();
    req.flash("success","Successfully created a new Campgrounds")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path:"reviews",
        populate:{
            path:"author"
        }
    }).populate("author");
    // if(!campground) throw new ExpressError("Camp Not Found",404);

    if(!campground){
        req.flash("error","Cannot Find the Campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show",{campground})
}


module.exports.renderEditForm = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash("error","Cannot Find That Campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit",{campground})
}

module.exports.updateCampground = async(req,res)=>{
    const {id}=req.params
    const campground = await Campground.findByIdAndUpdate(id,req.body.campground)
    
    const imgs=req.files.map(f =>({url:f.path, filename: f.filename}))
    //imgs = [{url,filename},{url,filename},{url,filename}]
    //and images stores array of objects! so if we directly push
    // [ [{url,filename},{url,filename},{url,filename}] ,{url,filename}]
    //Hence we destructurize the imgs arrays to objects
    campground.images.push(...imgs)
    await campground.save()
    
    //Deleting Images From Mongo Delete and Cloudinary
    if(req.body.deleteImages)
    {   
        for(let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}})
        console.log(campground)
    }

    req.flash("success","Successfully Updated a Campgrounds")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req,res)=>{
    const {id}=req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id))
    {
        req.flash("error","You Dont Have Permission")
        return res.redirect(`/campgrounds/${id}`)
    }
    await Campground.findByIdAndDelete(id);
    req.flash("success","Successfully Deleted a Campgrounds")

    res.redirect("/campgrounds")
}