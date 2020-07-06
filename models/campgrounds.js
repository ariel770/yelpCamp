var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   
   image:{
      home:String,
      autside:String
   },
   description: String,
   price: String,
   location:String, 
   author:{
      id:{ 
         type:mongoose.Schema.Types.ObjectId,
         ref:"User"
      },
      username:String
   },
   orders:[
      {
         type:mongoose.Schema.Types.ObjectId,
         ref:"Order"
      }
   ],
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   occupancyReservation:Boolean 
});

module.exports = mongoose.model("Campground", campgroundSchema);

