const getUserDetailsFromToken = require("../helpers/getUserDetails");
const userModel = require("../models/UserModel");

async function updateUser(req, res){
    try{
        const token=req.cookies.token || "";

        const user=await getUserDetailsFromToken(token);

        const {name, profile_pic}=req.body;

        const update_user=await userModel.updateOne({_id: user._id}, {name, profile_pic});

        const updatedUserInfo=await userModel.findById(user._id);

        return res.status(200).json({
            message: "User updated successfully",
            data: updatedUserInfo,
            success: true
        })
    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true
        })
    }
}

module.exports=updateUser;