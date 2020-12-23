
var express = require('express');
var route = express.Router();
var Campground = require("../models/campgrounds");
var Order = require("../models/order");
var User = require("../models/user");
var middelewhere = require("../middlewhere/index");
const SendmailTransport = require('nodemailer/lib/sendmail-transport');
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
                    Order.find({}, function (err, order) {
                        if (err) {
                        } else {
                            res.render("order/reservation", { campground: campground, user: user, order: order });
                        }
                    });
                }
            });

        }
    });
});

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
                            } else {
                                Campground.find({}, function (err, campground) {

                                    if (err) {
                                    } else {
                                        for (i = 0; i < campgroundid.orders.length; i++) {
                                            if (campgroundid.orders[i] == newOrder.id) {
                                                Order.findById(campgroundid.orders[i], function (err, orderi) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        var a = time(orderi.from, orderi.to);
                                                        var userMail = sendit(user, campgroundid, a)
                                                        var adminMail = senditAdmin(user, campgroundid, a)
                                                        //  ==========================
                                                        console.log(a)
                                                        console.log(userMail)
                                                        console.log(adminMail)
                                                        //  ==========================
                                                        transporter.sendMail(userMail, function (error, info) {
                                                            if (error) {
                                                                console.log(error);
                                                            } else {
                                                                console.log('Email sent: ' + info.response);
                                                            }
                                                        });
                                                        transporter.sendMail(adminMail, function (error, info) {
                                                            if (error) {
                                                                console.log(error);
                                                            } else {
                                                                console.log('Email sent: ' + info.response);
                                                            }
                                                        });

                                                    };
                                                });

                                            } else {

                                            }

                                        }
                                        res.redirect("/campGround/" + campgroundid.id);
                                        //   res.redirect("back");
                                        // res.redirect("/campGround/" + campground.id + "/order/" + user._id);
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
function sendit(user, details, a) {
    mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: user.contact.email,
        subject: details.name,
        html:
            "<html><head>" +
            "<title>Document</title>" +
            "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\"" +
            " integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">" +
            "</head>" +
            " <body style=\" border: 3px solid black ;margin: 3px;background-color: rosybrown;\" >" +

            "<div style=\" text-align: center;color: white;text-decoration: underline;\">" +


            "<h1> ברוכים הבאים לצימר : " + details.name + "<h1>" +
            "<br/>" +
            "<h3> הצימר ממוקם ב  : " + details.location + "<h3>" +
            "<br/>" +
            "<br/>" +
            "<div> מתאריך   : " + a.from1 + " </div>" +
            "<div> עד  :  " + a.to1 + " </div>" +
            "<div> סך ימים   : " + a.diffDays + " </div>" +
            "<br/>" +
            "<p> המחיר ללילה הוא :  " + details.price + "<p>" +
            "<p> סך הכל  :  " + a.diffDays * details.price + "  ש\"ח <p>" +
            "<br/>" +
            "<div style=\" text-align: center; background-color: green ;\">" +
            "<div> מארח  : " + details.author.username + "</div>" +
            "<div> לפרטים נוספים : " + details.author.contact.phone + "</div>" +
            "<div> מייל  : " + details.author.contact.email + "</div>" +
            "</div>" +
            "<br/>" +

            "<div style=\"color: orange;\">" + details.includeThings.parking + "</div>" +
            "</div>" +
            "</body>" +
            " </html>"

    }

    return mailOptions;
}
function senditAdmin(user, details, a) {
    mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: details.author.contact.email,
        subject: details.name,
        html:
            "<html><head>" +
            "<title>Document</title>" +
            "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\"" +
            " integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">" +
            "</head>" +
            " <body style=\" border: 3px solid black ;margin: 3px;background-color: rosybrown;\" >" +

            "<div style=\" text-align: center;color: white;text-decoration: underline;\">" +


            "<h1> מר : " + details.author.username + "<h1>" +
            "<h1>    התקבלה הזמנה  בצימר: " + details.name + " <h1>" +
            "<br/>" +
            "<br/>" +
            "<div> מתאריך   : " + a.from1 + " </div>" +
            "<div> עד  :  " + a.to1 + " </div>" +
            "<div> סך ימים   : " + a.diffDays + " </div>" +
            "<br/>" +
            "<p> סך הכל  :  " + a.diffDays * details.price + "  ש\"ח <p>" +
            "<br/>" +
            "<div style=\" text-align: center; background-color: green ;\">" +
            "<div> מזמין  : " + user.username + "</div>" +
            "<div> לפרטים נוספים : " + user.contact.phone + "</div>" +
            "<div> מייל  : " + user.contact.email + "</div>" +
            "</div>" +
            "<br/>" +

            "</body>" +
            " </html>"

    }

    return mailOptions;
}
function time(a, b) {
    var date = new Date(a)
    var date1 = new Date(b)
    var month = date.getMonth() + 1
    var month1 = date1.getMonth() + 1
    var from1 = date.getDate() + " / " + month + " / " + date.getFullYear()
    var to1 = date1.getDate() + " / " + month1 + " / " + date1.getFullYear()
    var oneDay = 24 * 60 * 60 * 1000;
    var firstDate = new Date(date);
    var secondDate = new Date(date1);
    var diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
    return { from1, to1, diffDays };
}
module.exports = route;





