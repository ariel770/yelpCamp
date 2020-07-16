var express = require('express');
var route = express.Router();
var Campground = require('../models/campgrounds');
var Order = require('../models/order');
var User = require('../models/user');
var middlewhere  = require('../middlewhere/index.js')



route.post("/filtering",function(req,res){
    var currentLocation = req.body.filter;
    var obj = {}   
    if(currentLocation !==""){
        obj.location= currentLocation; 
        
    }else{
        obj = {};
        }
    console.log(" obj  :   "+ obj)
    Campground.find(obj,function(err,camp){

        if(err){
            res.redirect("back");
        }else{
                res.render("campground/index",{camp: camp ,currentUser:req.user});
            }
    })
});
route.post("/sortby",function(req,res){
    var obj = {}
     var sort = req.body.sort; 
     obj[sort]= "1" ; 
     console.log(obj)
    Campground.find({}).sort(obj).exec(function(err,camp){
        if(err) {
            console.log("Error Finding Query " + err);
        }
        
        res.render("campground/index",{camp: camp ,currentUser:req.user});
    });
    
    
})

route.get("/",function(req,res){
    Campground.find({},function(err,campground){
            if(err){
           console.log(err)     
       }else{
           res.render("campground/index",{ campground: campground ,currentUser:req.user});
       }    
   })    
});   



route.post("/",middlewhere.isLoggedIn,function(req,res){
    var name = req.body.name;
    var image ={
       home :req.body.home,
       autside :req.body.autside,
       home1 :req.body.home1,
       autside1 :req.body.autside1
     };
    var desc = req.body.description;
    var price = req.body.price;
    var location = req.body.location;
    var author = {
                    id:req.user.id,
                    username:req.user.username
                 };    
    var contact = req.body.contact;
    var newCG = {contact:contact, name:name,image:image,description:desc,price:price,author:author,location:location};             
   
    Campground.create(newCG,function(err,campground){
        if(err){
            console.log(err);
        }else{
        //  console.log(camp);   
        // res.render("campground/show",{campground:campground});    
        res.redirect("/campGround/"+campground.id);
    } 
});
});    

route.get("/new",middlewhere.isLoggedIn,function(req,res){
    Campground.find({},function(err,campground){
        if(err){

            res.redirect("back");
        }else{
            res.render("campground/newCampground",{campground:campground});
        }
    })
});    





route.get("/:id",middlewhere.isLoggedIn,function(req,res){
    
    Campground.findById(req.params.id).populate("comments").exec(function(err,campground){
        if(err){
            console.log(err);
        }else{

            res.render("campground/show",{campground:campground});
        }    
        
    })    
});    




route.get("/:id/edit",middlewhere.permissionToMakeChangesInCampgrounds,function(req,res){
        Campground.findById(req.params.id,function(err,campground){
            res.render("campground/edit",{campground:campground});
   })         
})   


route.put("/:id",middlewhere.permissionToMakeChangesInCampgrounds,function(req,res){
   var campground = {
    name: req.body.name, 
    image:{
       home: req.body.home,
       autside: req.body.autside
    },
    price:req.body.price 
}
    Campground.findByIdAndUpdate(req.params.id,campground,function(err,campupdate){
        if(err){
            res.redirect("/campGround")
        }else{
            console.log("success"+ campupdate)
           res.redirect("/campGround/"+campupdate.id); 
        }   
    })    
})    
route.delete("/:id",function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/campGround");
        }else{
            res.redirect("/campGround");
        }    
    })    

})    



module.exports = route; 