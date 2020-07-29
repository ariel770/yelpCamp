var express = require('express');
var route = express.Router();
var Campground = require('../models/campgrounds');
var Order = require('../models/order');
var User = require('../models/user');
var middlewhere = require('../middlewhere/index.js');
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

route.post("/filtering", function (req, res) {
    var currentLocation = req.body.filter;
    var obj = {}
    if (currentLocation !== "") {
        obj.location = currentLocation;
    } else {
        obj = {};
    }
    Campground.find(obj, function (err, campground) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("campground/index", { campground: campground, currentUser: req.user });
        }
    })
});


route.post("/filterandsort", function (req, res) {
    var currentLocation = req.body.filter;
    var obj = {}
    if (currentLocation !== "") {
        obj.location = currentLocation;
    } else {
        obj = {};
    }
    var obj1 = {}
    var sort = req.body.sort;
    obj1[sort] = "1";
    Campground.find(obj).sort(obj1).exec(function (err, campground) {
        if (err) {
            res.redirect("back");
        } else {

            res.render("campground/index", { campground: campground, currentUser: req.user });
        }
    });



})

route.post("/sortby", function (req, res) {
    var obj = {}
    var sort = req.body.sort;
    obj[sort] = "1";
    console.log(obj)
    Campground.find({}).sort(obj).exec(function (err, campground) {
        if (err) {
            console.log("Error Finding Query " + err);
        }

        res.render("campground/index", { campground: campground, currentUser: req.user });
    });


})

route.get("/", function (req, res) {
    Campground.find({}, function (err, campground) {
        if (err) {
            console.log(err)
        } else {
            res.render("campground/index", { campground: campground, currentUser: req.user });
        }
    })
});


route.post("/", middlewhere.isLoggedIn, function (req, res) {
    var name = req.body.name;
    var image = {
        home: req.body.home,
        autside: req.body.autside,
        home1: req.body.home1,
        autside1: req.body.autside1
    };
    var desc = req.body.description;
    var price = req.body.price;
    var kashrut = req.body.kashrut;
    var author = {
        id: req.user.id,
        username: req.user.username,
        contact: req.user.contact
    };
    var includeThings = {
        airconditioner: req.body.airconditioner,
        parking: req.body.parking,
        platter: req.body.platter,
        crib: req.body.crib,
        linen: req.body.linen,
        kettle: req.body.kettle
    }
    
    geocoder.geocode(req.body.location, function (err, data) {
       
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {includeThings:includeThings, price:price,kashrut:kashrut, name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, campground){
            if(err){
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log( campground);
                res.redirect("/campGround/" + campground.id);
            }
        });
      });
    });
  
    

route.get("/new", middlewhere.isLoggedIn, function (req, res) {
    Campground.find({}, function (err, campground) {
        if (err) {

            res.redirect("back");
        } else {
            res.render("campground/newCampground", { campground: campground });
        }
    })
});





route.get("/:id", middlewhere.isLoggedIn, function (req, res) {

    Campground.findById(req.params.id).populate("comments").exec(function (err, campground) {
        if (err) {
            console.log(err);
        } else {

            res.render("campground/show", { campground: campground });
        }

    })
});




route.get("/:id/edit", middlewhere.permissionToMakeChangesInCampgrounds, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        res.render("campground/edit", { campground: campground });
    })
})

// UPDATE CAMPGROUND ROUTE
// route.put("/:id", middlewhere.permissionToMakeChangesInCampgrounds, function(req, res){
// //     console.log("-=========="+  req.body.location)
//     geocoder.geocode(req.body.location, function (err, data) {
//         if (err || !data.length) {
//             req.flash('error', 'Invalid address');
//             return res.redirect('back');
//       }
//       console.log("1")
//       //   req.body.campground.lat = data[0].latitude;
//       //   req.body.campground.lng = data[0].longitude;
//       //   req.body.campground.location = data[0].formattedAddress;
      
//       var lat = data.results[0].geometry.location.lat;
//       var lng = data.results[0].geometry.location.lng;
//       console.log("2")
//       var location = data.results[0].formatted_address;
//       var newData = {campground:req.body.campground, location: location, lat: lat, lng: lng};
//       console.log("3")
//       Campground.findByIdAndUpdate(req.params.id, newData, function(err, campground){
//           if(err){
//               req.flash("error", err.message);
//               res.redirect("back");
//           } else {
//               req.flash("success","Successfully Updated!");
//               res.redirect("/campgrounds/" + campground._id);
//           }
//       });
//     }); 
//   });
route.put("/:id", middlewhere.permissionToMakeChangesInCampgrounds, function (req, res) {
    var campground = {
        name: req.body.name,
        image: {
            home: req.body.home,
            autside: req.body.autside
        },
        price: req.body.price
    }
    Campground.findByIdAndUpdate(req.params.id, campground, function (err, campupdate) {
        if (err) {
            res.redirect("/campGround")
        } else {
            console.log("success" + campupdate)
            res.redirect("/campGround/" + campupdate.id);
        }
    })
});
route.delete("/:id", function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/campGround");
        } else {
            res.redirect("/campGround");
        }
    })

})



module.exports = route; 