const userModel = require("../models/UserModel");
const bcryptjs=require("bcryptjs");
const jwt=require("jsonwebtoken");

async function checkPassword(req, res){
    try{
        const {password, userId}=req.body;

        const user=await userModel.findById(userId);

        const verifyPassword=await bcryptjs.compare(password, user.password);

        if(!verifyPassword){
            return res.status(400).json({
                message: "Please check password",
                error: true
            })
        }

        const tokenData={
            id: user._id,
            email: user.email
        };

        const token=jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
            expiresIn: "1d"
        });

        const cookieOptions={
            httpOnly: true,
            secure: false
        }

        return res.cookie("token", token, cookieOptions).status(200).json({
            message: "Login successful",
            token: token,
            success: true
        });
    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true
        })
    }
}

module.exports=checkPassword;