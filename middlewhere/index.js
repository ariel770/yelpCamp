var Campground = require('../models/campgrounds')
var Comment = require('../models/comment')
var middlewhereObj = {} ;

middlewhereObj.checkDates = function(req,res,next){
    var a = new Date(req.body.from);
    var b = new Date (req.body.to);
    if(a.getDate()< b.getDate()){
        console.log(a + b)
       next();
    }else{
        req.flash("error","Check your dates ! ")
        res.redirect("back");
    }

}

middlewhereObj. permissionToMakeChangesInCampgrounds = function(req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id,function(err,campground){
            if(err){
                req.flash("error","campground not found")
                res.redirect("back");
            }else{
                if(campground.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error","you do not have permission to do that ! ")
                    res.redirect("back");
                }     
            }
        })
    }else{
        req.flash("error","You need to logged in first!")
        res.redirect("back");
    }

}
middlewhereObj.permissionToMakeChangesInComments = function(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,comment){
            if(err){
                req.flash("error","comment  not found")
                res.redirect("back");
            }else{
                if(comment.author.id.equals(req.user._id)){
                     next();
                    }else{
                        req.flash("error","comment  not found")
                    res.redirect("back");
                }     
            }
        })
    }else{
        req.flash("error","you dont have permission to do that")
        res.redirect("back");
    }

}
middlewhereObj.isLoggedIn = function (req,res,next){
   
    if(req.isAuthenticated()){
        return next();
    }
   req.flash('error', 'You need to be  Logged in first!');
   res.redirect("/login");
}
module.exports = middlewhereObj;