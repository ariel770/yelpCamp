var express = require('express');
var route = express.Router({mergeParams:true});
var Campground = require('../models/campgrounds');
var Comment = require('../models/comment');
var middlewhere  = require('../middlewhere/index.js')

route.get("/new",middlewhere.isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err)
        }else{
            res.render("comment/newComment",{campground:campground});
        }
    })

})



route.post("/",middlewhere.isLoggedIn,function(req,res){
  Campground.findById(req.params.id,function(err,campground){
      if(err){
          console.log(err)
      }else{
          Comment.create(req.body.comment,function(err,comment){
              
              
              comment.author.id  = req.user._id; 
              comment.author.username  = req.user.username; 
              comment.save();
              campground.comments.push(comment);
              req.flash("success","your comment has stored");
              campground.save(function(err,data){
                  if(err){

                  }else{
                      res.redirect("/campground/"+campground._id);

                  }
              })
          })
      }
  })
})
//COMMENT EDIT ROUTE 
route.get("/:comment_id/edit",middlewhere.permissionToMakeChangesInComments,function(req,res){
    Comment.findById(req.params.comment_id,function(err,comment){
        if(err){
            res.redirect("back")
        }else{
            res.render("comment/edit",{campground_id:req.params.id,comment:comment});
            
        }
    }) 
})


//COMMENT UPDATE ROUTE 
route.put("/:comment_id",middlewhere.permissionToMakeChangesInComments,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,comment){
        if(err){
            res.redirect("back")
        }else{
            res.redirect("/campground/"+req.params.id);
            // res.redirect("campground/show/");
        }
    })
    
    
})
//COMMENT  DELETE ROUTE 
route.delete("/:comment_id",middlewhere.permissionToMakeChangesInComments,function(req,res){
  Comment.findByIdAndRemove(req.params.comment_id,function(err,del){
      if(err){
          res.redirect("back");
      }else{
          res.redirect("/campground/"+req.params.id);

      }
  })

})
module.exports = route ; 