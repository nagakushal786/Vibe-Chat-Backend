const express=require("express");
const cors=require("cors");
require("dotenv").config();
const connectDB=require("./config/connectDB");
const router=require("./routers/route");
const cookieParser=require("cookie-parser");
const {app, server}=require("./socket/socketIndex");

// const app=express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const PORT=8082;

app.get("/", (req, res)=> {
    res.json({
        message: "Server is running at port "+PORT
    })
});

app.use("/api", router);

connectDB().then(()=> {
    server.listen(PORT, ()=> {
        console.log("Server running at port", PORT);
    });
});