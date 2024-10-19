const express=require("express");
const cors=require("cors");
require("dotenv").config();
const connectDB=require("./config/connectDB");
const router=require("./routers/route");
const cookieParser=require("cookie-parser");
const {app, server}=require("./socket/socketIndex");

// const app=express();

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [process.env.FRONTEND_URL];
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

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