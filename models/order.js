var mongoose = require('mongoose')
var orderSchema = new mongoose.Schema({
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
           },
        username:String
    },
    from:Date,
    to:Date,
    campground:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Campgrounds"
    },
    total:Number
})

module.exports = mongoose.model("Order",orderSchema);