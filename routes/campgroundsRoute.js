var express = require('express');
var route = express.Router();
var Campground = require('../models/campgrounds');
var Order = require('../models/order');
var User = require('../models/user');
var middlewhere = require('../middlewhere/index.js');
var NodeGeocoder = require('node-geocoder');
var path = require('path');
var multer = require('multer');
var fs = require('fs');
// ==> SAVE IMAGES IN DB
// =================================================
//  set storage engine
var storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
        if (file.fieldname === "home") {
        
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
        else if (file.fieldname === "home1") {
         
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
        else if (file.fieldname === "autside") {
         
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
        else if (file.fieldname === "autside1") {
         
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    }
});


// init upload
var upload = multer({

    // limits: { fileSize: 2000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    storage: storage
});

// check files 
function checkFileType(file, cb) {

    var fileType = /jpg|jpeg|png|gif/;

    var extname = fileType.test(path.extname(file.originalname).toLowerCase());

    var mimetype = fileType.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb('Error : Images Only ')
    }

}

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


route.post("/", middlewhere.isLoggedIn, upload.fields([{ name: "home", maxCount: 1 }, { name: "home1", maxCount: 1 },
{ name: "autside", maxCount: 1 }, { name: "autside1", maxCount: 1 }]), function (req, res) {
    var name = req.body.name;

    var image = {
        home: {
            data: fs.readFileSync(path.join('./public/uploads/') + req.files.home[0].filename),
            contentType: 'image/png'
        },
        home1: {
            data: fs.readFileSync(path.join('./public/uploads/') + req.files.home1[0].filename),
            contentType: 'image/png'
        },
        autside: {
            data: fs.readFileSync(path.join('./public/uploads/') + req.files.autside[0].filename),
            contentType: 'image/png'
        },
        autside1: {
            data: fs.readFileSync(path.join('./public/uploads/') + req.files.autside1[0].filename),
            contentType: 'image/png'
        }
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
        var newCampground = { includeThings: includeThings, price: price, kashrut: kashrut, name: name, image: image, description: desc, author: author, location: location, lat: lat, lng: lng };
        // Create a new campground and save to DB
        Campground.create(newCampground, function (err, campground) {
            if (err) {
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(campground);
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





// route.get("/:id", middlewhere.isLoggedIn, function (req, res) {
route.get("/:id", function (req, res) {

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

route.put("/:id", middlewhere.permissionToMakeChangesInCampgrounds, function (req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, campupdate) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success", "Successfully Updated!");
                res.redirect("/campGround/" + campupdate.id);
            }
        });
    });
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