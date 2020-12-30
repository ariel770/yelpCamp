var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   kashrut: String,
   name: String,
   contact: String,
   location: String,
   lat: Number,
   lng: Number,
  
   image: {
      home: {
         data: Buffer,
         contentType: String,
    
     },
      home1:{
         data: Buffer,
         contentType: String,
    
     },
      autside: {
         data: Buffer,
         contentType: String,
    
     },
      autside1: {
         data: Buffer,
         contentType: String,
    
     }
   },
   description: String,
   price: String,
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

