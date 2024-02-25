import express from "express";
const app = express();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from 'uuid';
import auth from "./service/auth.js";

// Now you can use auth.setUser and auth.getUser


app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

mongoose
.connect("mongodb://127.0.0.1:27017/loginDB")
.then(()=>{console.log("MongoDB connected")})
.catch((err)=>{console.log("Error in connecting with database " , err)});

const user_schema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    
},
{
    timestamps:true
}
);

const User = mongoose.model("users",user_schema);

app.post("/register",async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password,10);
        const result = await User.create({
            email: req.body.email,
            username:req.body.username,
            password:hashedPassword
          });
          //console.log(result);
          res.redirect("/login");
    }
    catch(e){
        console.log("Error in post ", e);
        res.redirect("/login");
    }
})
async function restrictToLoggedInUserOnly(req,res,next){
    const userUid = req.cookies.uid;
    if(!userUid){
        res.redirect("/login");
        return;
    }
    const user = auth.getUser(userUid);
    if(!user){
        res.redirect("/login");
        return;
    }
    req.user = user;
    next();

}
app.post("/login", async (req, res) => {
    try {
        const tempUser = await User.findOne({ username: req.body.username });
        //console.log(tempUser);
        if (!tempUser) {
            return res.render("./login", {
                error: "Invalid username or password!"
            });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, tempUser.password);

        if (!isPasswordValid) {
            return res.render("./login", {
                error: "Invalid username or password!"
            });
        }
        //Sab kuch correct hai
        const token = auth.setUser(tempUser);
        res.cookie("uid",token);
        return res.redirect("/");
    } catch (e) {
        console.log("Error in catch block of login route: ", e);
        res.redirect("/login");
    }
});

//Routes jinko routes file m dalna h
app.get("/",restrictToLoggedInUserOnly,(req,res)=>{
    res.render("home.ejs");
});
app.get("/interactiveCourses",restrictToLoggedInUserOnly,(req,res)=>{
    res.render("interactiveCourses.ejs");
});
app.get("/attendance",(req,res)=>{
    res.render("attendance.ejs");
});
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
app.get("/register",(req,res)=>{
    res.render("register.ejs");
})

//Routes khatam
app.listen(3000,()=>{
    console.log("Server Started");
});
