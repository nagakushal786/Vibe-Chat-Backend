async function logOut(req, res){
    try{
        const cookieOptions={
            httpOnly: true,
            secure: false
        }

        return res.cookie("token", "", cookieOptions).status(200).json({
            message: "User logged out successfully",
            success: true
        })
    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true
        })
    }
}

module.exports=logOut;