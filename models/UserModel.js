const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide your name"]
    },
    email: {
        type: String,
        required: [true, "Provide your email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Provide the password"]
    },
    profile_pic: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const userModel=mongoose.model("User", userSchema);

module.exports=userModel;