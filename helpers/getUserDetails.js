const jwt=require("jsonwebtoken");
const userModel=require("../models/UserModel");

const getUserDetailsFromToken=async (token)=> {
    if(!token){
        return{
            message: "Session timed out",
            logout: true
        };
    }

    try{
        const decode=await jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user=await userModel.findById(decode.id).select("-password");

        if(!user){
            return{
                message: "User not found",
                logout: true
            };
        }

        return user;
    }catch(error){
        return{
            message: "Invalid or expired session",
            logout: true
        };
    }
};

module.exports=getUserDetailsFromToken;