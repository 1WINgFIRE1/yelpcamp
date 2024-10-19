
const User = require("../models/user")


module.exports.renderRegister = (req,res)=>{
    res.render("users/register")
}

module.exports.register = async(req,res)=>{
    try{
        const {email,username,password} = req.body;
        const user = new User({email,username});
        const registerUser = await User.register(user, password)
        
        req.login(registerUser, err => {
            if(err) return next(err);
            req.flash("success","Welcome To YelpCamp!")
            res.redirect("/campgrounds")   
        })
         
    }catch(e){
        req.flash("error",e.message)
        res.redirect("/register")
    }
    
}

module.exports.renderLogin = (req,res)=>{
    res.render("users/login")
}

module.exports.Login = (req,res)=>{
    req.flash("success", "Welcome Back")
    const redirectTo = res.locals.returnTo || "/campgrounds"; 
    delete res.locals.returnTo
    res.redirect(redirectTo)
}


module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "Goodbye");
        res.redirect("/campgrounds");
    });
}
