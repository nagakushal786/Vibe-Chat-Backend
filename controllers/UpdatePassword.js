const getUserDetailsFromToken=require("../helpers/getUserDetails");
const userModel=require("../models/UserModel");
const bcryptjs=require("bcryptjs");

async function updatePassword(req, res){
    try{
        const token=req.cookies.token || "";

        const user=await getUserDetailsFromToken(token);

        const {newPassword}=req.body;

        if(!newPassword || newPassword.length<4){
            return res.status(400).json({
                message: "New password should contain atleast 4 characters",
                error: true
            })
        }

        const hashNewPassword=await bcryptjs.hash(newPassword, 10);

        const updatedUser=await userModel.updateOne({_id: user?._id}, {password: hashNewPassword});

        return res.status(200).json({
            message: "Password updated successfully",
            data: updatedUser,
            success: true
        });
    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true
        })
    }
}

module.exports=updatePassword;