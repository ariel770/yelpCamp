var express = require('express');
var route = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Order = require('../models/order');
const campgrounds = require('../models/campgrounds');


route.get("/", function (req, res) {
    res.render("landingpage");
});



//AUTH ROUTE  == REGISER

route.get("/register", function (req, res) {
    res.render("register");
})

route.post("/register", function (req, res) {
    var newuser = { username: req.body.username, UserType: 'user', contact: req.body.contact }
    User.register(new User(newuser), req.body.password, function (err, user) {
        console.log("newuser :  " + user);
        if (err) {
            console.log(err);
            req.flash('error', err.message + " : " + err.name);
            return res.render("register")
        }

        User.authenticate("local")(req, res, function () {

            req.flash('success', 'נרשמת בהצלחה!');
            res.redirect("/campground");

        })

    })


})
route.get("/onlylogin", function (req, res) {

    res.render("onlylogin");

})

route.post("/onlylogin", passport.authenticate("local", {
    successRedirect: "/campground",
    failureRedirect: "/login"
}), function (req, res) {

})
route.get("/login", function (req, res) {

    res.render("loginllessid");

})

route.post("/login", passport.authenticate("local", {
    successRedirect: "/campground",
    failureRedirect: "/login"
}), function (req, res) {

})
//AUTH ROUTE  == LOGIN
route.get("/login/:id", function (req, res) {

    res.render("login", { campground: req.params.id });

})

route.post('/login/:id', function (req, res, next) {
    passport.authenticate('local', { failureFlash: true }, function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            return res.redirect('/campground/' + req.params.id);
        });
    })(req, res, next);
});


//AUTH ROUTE  == LOGOUT

route.get("/logout", function (req, res) {
    req.logout();
    req.flash('success', 'logged out!');
    res.redirect("/campground");
})

module.exports = route;