var mongoose = require('mongoose');
var PassportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    username:String,
    passport:String,
    UserType:String,
    order : [
            {
             type:mongoose.Schema.Types.ObjectId,    
             ref:"Order"
            }
            ]
    
});
userSchema.plugin(PassportLocalMongoose)
module.exports = mongoose.model("User",userSchema);
//