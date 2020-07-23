var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   kashrut: String,
   name: String,
   contact: String,
   image: {
      home: String,
      autside: String,
      home1: String,
      autside1: String
   },
   description: String,
   price: String,
   location: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String,
      contact: {
         phone: Number,
         email: String
      }
   },
   orders: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Order"
      }
   ],
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   occupancyReservation: Boolean,

   includeThings: {
      airconditioner: String,
      parking: String,
      platter: String,
      crib:String,
      linen: String,
      kettle: String
   }

});

module.exports = mongoose.model("Campground", campgroundSchema);

