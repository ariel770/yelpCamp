var express = require('express');
var route = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Order = require('../models/order');


route.get("/",function(req,res){
    res.render("landingpage");
});



//AUTH ROUTE  == REGISER

route.get("/register",function(req,res){
    res.render("register");
})

route.post("/register",function(req,res){
    User.register(new User({username:req.body.username, UserType:'user'}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            req.flash('error', err.message +" : "+ err.name);
            return res.render("register")
        }
        
        User.authenticate("local")(req,res,function(){
            req.flash('success', 'נרשמת בהצלחה!');
            res.redirect("/campground");
           
        })
        
    } )
    
    
})
//AUTH ROUTE  == LOGIN
route.get("/login",function(req,res){
    res.render("login");
    
})

route.post("/login",passport.authenticate("local",{
    successRedirect:"/campground",
    failureRedirect:"/login"
}),function(req,res){

})

//AUTH ROUTE  == LOGOUT

route.get("/logout",function(req,res){
    req.logout();
    req.flash('success', 'logged out!');
    res.redirect("/campground");
})

module.exports = route;