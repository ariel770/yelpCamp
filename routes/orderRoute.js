
var express = require('express');
var route = express.Router();
var Campground  = require("../models/campgrounds");
var Order  = require("../models/order");
var User  = require("../models/user");
 var middelewhere = require("../middlewhere/index")



 // GET ALL ORDERS (also from other campgrounds) FROM CURRENT USER  
route.get("/order/:user_id/",function(req,res){
    User.findById(req.params.user_id,function(err,user){
        if(err){
            res.redirect("back");
        }else{
            Order.find({"_id":{$in:user.order}},function(err,order){
                if(err){
                    res.redirect("back");
                 }else{
                    Campground.find({},function(err,campground){
                        if(err){
                            res.redirect("back")  
                        }else{
                            res.render("order/showOrders",{user:user,order:order,camp:campground});
                        }
                    })

                 }
             })
        }
    })
})

// GET ALL ORDERS (also from other campgrounds) FROM CURRENT USER  
route.get("/:campground_id/order/:user_id/",function(req,res){
    User.findById(req.params.user_id,function(err,user){
        if(err){
                    res.redirect("back"); 
                }else{
                    Order.find({"_id":{$in:user.order}},function(err,order){
                        if(err){
                            res.redirect("back");
                        }else{
                            Campground.find({},function(err,campground){
                                if(err){
                                    res.redirect("back")  
                                }else{
                                    res.render("order/showOrders",{user:user,order:order,camp:campground});
                                }
                            })
                        }     
                    })    
                }   
            })        
})

// NEW ORDER
route.get("/:campground_id/order/:user_id/new",function(req,res){
    Campground.findById(req.params.campground_id,function(err,campground){
        if(err){
            res.redirect("back")                        
        }else{
            User.findById(req.params.user_id,function(err,user){
                if(err){
                    res.redirect("back")                        
                }else{
                    res.render("order/reservation",{campground:campground,user:user});
                }
            })
            
        }
    })
})
// INSERT TO DB ORDER FROM CURRENT USER
route.post("/:campground_id/order/:user_id/",middelewhere.checkDates,function(req,res){

    var body = {
        campground : req.params.campground_id,
        from : req.body.from,
        to : req.body.to,
        author :{
             id: req.params.user_id,
             username : req.user.username 
        }    
               
    }
    Order.create(body,function(err,newOrder){
        if(err){
             res.redirect();
        }else{   
            User.findById(req.params.user_id,function(err,user){
                if(err){
                    res.redirect("back")                        
                }else{
                    Campground.findById(req.params.campground_id,function(err,camp){
                        if(err){
                            res.redirect("back")                        
                        }else{
                            camp.occupancyReservation = true ;
                            console.log("    ======= ======= ======= =======  ======== ======= ======= = =======   :    "+camp)
                            camp.orders.push(newOrder)
                            camp.save();
                        }
                    })      
                    user.order.push(newOrder);
                    user.save();
                    Order.find({"_id":{$in:user.order}},function(err,order){
                        if(err){
                            res.redirect("back");
                        }else{ 
                            Campground.find({},function(err,camp){
                                if(err){
                                }else{
                                    res.redirect("/campGround/"+camp.id+"/order/"+user._id);            
                                }
                            })
                            
                        }     
                    })    
                    
                }
            })
        }
    })
})
//GET ALL ORDERS FROM THIS CAMPGROUND
route.get("/:campground_id/orders",function(req,res){
      Campground.findById(req.params.campground_id,function(err,campground){
        if(err){
            res.redirect("back")                   
              
        }else{
            //                [ { $match : { author : "dave" } } ]
            Order.find({"_id":{$in:campground.orders}},function(err,order){
                if(err){
                    res.redirect("back")                   
                }else{
                    res.render("order/showOrdersFromCampgrounds",{order:order,campground:campground});    
                }
            })
        }
    })
})


module.exports = route;







//====================== PREVIUS VERSIONS  =======================
// ============================== Orders #2 =============================== //

//=================== just orders without campground
//   route.get("/:id/order/new",function(req,res){
    //     User.findById(req.params.id,function(err,user){
        //         if(err){
            //             res.redirect("back")
            //         }else{
                //         res.render("order/reservation",{user:user});    
                
                //         }
                //     })    
                //     })    
                
                //   route.post("/:id/order",function(req,res){
                    //          User.findById(req.params.id,function(err,user){
                        //              if(err){
                            //              res.redirect('back')    
                            //              }else{
                                //                 Order.create(req.body.date,function(err,ord){
                                    //                     console.log(ord);
                                    //                     if(err){
                                        //                         res.redirect("back");
                                        //                     }else{
                                            //                         user.order.push(ord)
                                            //                         user.save();
                                            //                         res.redirect("/campGround/order/"+user._id)
                                            //                      }   
                                            //                  })    
                                            
                                            //              }    
                                            //          })    
                                            //     })     
                                            
                                            
                                            
                                            
                                            
                                            
                                            // ============================== Orders #1 =============================== //
                                            // get orders without user or campground or nothing 
                                            //route.get("/orders",function(req,res){
//     Order.find({},function(err,all){
    //         if(err){
        
        //             console.log(err);    
        //         }else{
            //             res.render('campground/showOrders',{all:all})    
            //         }
            
            //     })
            // })
            
            
            // route.get("/newOrder",function(req,res){
                
                //     res.render("order/reservation")      
                
                // })
                
                
                // route.post("/orders",function(req,res){
                    //     var from = req.body.from;    
                    //     var to = req.body.to;
                    //     var order= {from:from,to:to}
                    //     var author ={
                        //             id:req.user.id,    
                        //             username:req.user.username
                        //         }
                        //         var order = {author:author,from:from,to:to}
                        //         Order.create(order,function(err,newOrder){
                            //             if(err){
                                //                 console.log(err);    
                                //                 res.redirect('back')
                                //             }else{
                                    //                 res.redirect("/campGround/orders");    
                                    //             }
                                    //         })
                                    //  
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    //  Campground.findById(req.params.campground_id,function(err,camp){
                                    //      if(err){
                                    
                                    //      }else{
                                    //          camp.orders.push(newOrder)
                                    //          camp.save();
                                    //      }
                                    //  })      