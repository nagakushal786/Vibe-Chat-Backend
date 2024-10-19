const getUserDetailsFromToken=require("../helpers/getUserDetails");

async function getUserDetails(req, res){
    try{
        const token=req.cookies.token || "";

        const user=await getUserDetailsFromToken(token);

        if(user.logout){
            return res.status(401).json({
                message: user.message,
                logout: true
            });
        }

        return res.status(200).json({
            message: "Logged in user details",
            data: user
        });
    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = getUserDetails;