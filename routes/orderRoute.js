
var express = require('express');
var route = express.Router();
var Campground = require("../models/campgrounds");
var Order = require("../models/order");
var User = require("../models/user");
var middelewhere = require("../middlewhere/index");
nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});
var mailOptions;




// GET ALL ORDERS (also from other campgrounds) FROM CURRENT USER  
route.get("/order/:user_id/", function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
        if (err) {
            res.redirect("back");
        } else {
            Order.find({ "_id": { $in: user.order } }, function (err, order) {
                if (err) {
                    res.redirect("back");
                } else {
                    Campground.find({}, function (err, campground) {
                        if (err) {
                            res.redirect("back")
                        } else {
                            res.render("order/showOrders", { user: user, order: order, campground: campground });
                        }
                    })

                }
            })
        }
    })
})

// GET ALL ORDERS (also from other campgrounds) FROM CURRENT USER  
route.get("/:campground_id/order/:user_id/", function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
        if (err) {
            res.redirect("back");
        } else {
            Order.find({ "_id": { $in: user.order } }, function (err, order) {
                if (err) {
                    res.redirect("back");
                } else {
                    Campground.find({}, function (err, campground) {
                        if (err) {
                            res.redirect("back")
                        } else {
                            res.render("order/showOrders", { user: user, order: order, campground: campground });
                        }
                    })
                }
            })
        }
    })
})

// NEW ORDER
route.get("/:campground_id/order/:user_id/new", function (req, res) {
    Campground.findById(req.params.campground_id, function (err, campground) {
        if (err) {
            res.redirect("back")
        } else {
            User.findById(req.params.user_id, function (err, user) {
                if (err) {
                    res.redirect("back")
                } else {
                    res.render("order/reservation", { campground: campground, user: user });
                }
            })

        }
    })
})
// INSERT TO DB ORDER FROM CURRENT USER
route.post("/:campground_id/order/:user_id/", middelewhere.checkDates, function (req, res) {

    var body = {
        campground: req.params.campground_id,
        from: req.body.from,
        to: req.body.to,
        author: {
            id: req.params.user_id,
            username: req.user.username
        }
    }
    Order.create(body, function (err, newOrder) {
        if (err) {
            res.redirect();
        } else {
            User.findById(req.params.user_id, function (err, user) {
                if (err) {
                    res.redirect("back")
                } else {
                    Campground.findById(req.params.campground_id, function (err, campgroundid) {
                        if (err) {
                            res.redirect("back")
                        } else {
                            campgroundid.occupancyReservation = true;
                            campgroundid.orders.push(newOrder)
                            campgroundid.save();
                        }

                        user.order.push(newOrder);
                        user.save();
                        Order.find({ "_id": { $in: user.order } }, function (err, order) {
                            if (err) {
                                res.redirect("back");
                                //the problem is that the out put is array  I need to do array and coice the current order 
                                //need to sent mail also to the hosted 
                                // nedd to fix the page that send 
                            } else {
                                Campground.find({}, function (err, campground) {
                                    
                                    if (err) {
                                    } else {
                                    for(i=0 ; i<campgroundid.orders.length+1; i++){

                                        if(campgroundid.orders[i]== newOrder.id){
                                    console.log(i + " CORRECT " + "  NEWORDER.ID :  "+ newOrder.id +"  CAMPGROUNDID : "+  campgroundid.orders[i])
                                            Order.findById(newOrder.id,function(err,orderi){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                             var date = new Date(orderi.from)
                                             var date1 = new Date(orderi.to)
                                             var month  =  date.getMonth()+1
                                             var month1 =  date1.getMonth()+1
                                             var from =  date.getDate()+" / "+month+" / "+ date.getFullYear()
                                             var to =  date1.getDate()+" / "+month1+" / "+ date1.getFullYear()
                                             var oneDay = 24 * 60 * 60 * 1000; 
                                             var firstDate = new Date(date);
                                             var secondDate = new Date(date1); 
                                             var diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
                                                    mailOptions = {
                                                        from: process.env.MAIL_USERNAME,
                                                        to: user.contact.email,
                                                        subject: campgroundid.name,
                                                        html:
                                                        "<html><head>" +
                                                        "<title>Document</title>" +
                                                        "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\"" +
                                                        " integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">" +
                                                    "</head>" +
                                                    " <body style=\" border: 3px solid black ;margin: 3px;background-color: rosybrown;\" >" +
                                                    
                                                    "<div style=\" text-align: center;color: white;text-decoration: underline;\">" +
                                                    
                                                    
                                                    "<h1> ברוכים הבאים לצימר : " + campgroundid.name + "<h1>" +
                                                    "<br/>" +
                                                    "<h3> הצימר ממוקם ב  : " + campgroundid.location + "<h3>" +
                                                    "<br/>" +
                                                    "<br/>" +
                                                    "<div> מתאריך   : " +from+" </div>" +
                                                    "<div> עד  :  "+to +" </div>" +
                                                    "<div> סך ימים   : "+diffDays+" </div>" +
                                                    "<br/>" +
                                                    "<p> המחיר ללילה הוא :  " + campgroundid.price + "<p>" +
                                                    "<p> סך הכל  :  " +diffDays*campgroundid.price+ "  ש\"ח <p>" +
                                                    "<br/>" +
                                                    "<div style=\" text-align: center; background-color: green ;\">"+ 
                                                    "<div> מארח  : " + campgroundid.author.username + "</div>" +
                                                    "<div> לפרטים נוספים : " + campgroundid.author.contact.phone + "</div>" +
                                                    "<div> מייל  : " + campgroundid.author.contact.email + "</div>" +
                                                    "</div>" +
                                                    "<br/>" +
                                                    
                                                    "<div style=\"color: orange;\">" + campgroundid.includeThings.parking + "</div>" +
                                                    "</div>" +
                                                    "</body>" +
                                                    " </html>"
                                                }
                                                };
                                            });
                                      
                                        }else{
                                            console.log(i);
                                        }

                                    }
                                       
                                        transporter.sendMail(mailOptions, function (error, info) {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log('Email sent: ' + info.response);
                                            }
                                        });
                                        res.redirect("/campGround/" + campground.id + "/order/" + user._id);
                                    }
                                })

                            }
                        })
                    })

                }
            })
        }
    })
})
//GET ALL ORDERS FROM THIS CAMPGROUND
route.get("/:campground_id/orders", function (req, res) {
    Campground.findById(req.params.campground_id, function (err, campground) {
        if (err) {
            res.redirect("back")

        } else {

            Order.find({ "_id": { $in: campground.orders } }, function (err, order) {
                if (err) {
                    res.redirect("back")
                } else {
                    res.render("order/showOrdersFromCampgrounds", { order: order, campground: campground });
                }
            })
        }
    })
})


module.exports = route;





