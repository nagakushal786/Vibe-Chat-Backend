const mongoose=require("mongoose");

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        const connection=mongoose.connection;

        connection.on("connected", ()=> {
            console.log("Connected to DB successfully");
        });

        connection.on("error", (error)=> {
            console.log("Something went wrong:", error);
        })
    }catch(err){
        console.log("Something went wrong with mongoose:", err);
    }
}

module.exports=connectDB;