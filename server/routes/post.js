const express= require("express")
const router = express.Router() 
const mongoose= require("mongoose")
const requireLogin = require("../../middleware/requireLogin")
const Post= mongoose.model("Post")


router.get("/getAllPosts",(req,res)=>{


    Post.findById(req.user.ObjectId).populate("postedBy","_id name").then((posts)=>{

    res.send(posts)


    }).catch((err)=>{

        res.send(err);
    })




})


router.get("/myposts",requireLogin,(req,res)=>{
 
    Post.find({postedBy:req.user._id}).populate("PostedBy","_id name").then((myposts)=>{

    res.send(myposts);


    }).catch((err)=>{

   res.send(err);


    })   






})


router.post("/createpost",requireLogin,(req,res)=>{


    const {title,body}=req.body
    if(!title || !body){

        return res.status(422).json("error:{Please Enter All The Fields}")

    }

    req.user.password= undefined;

   const post = new Post({
    title,
    body,
    postedBy: req.user
   })

   post.save().then((result)=>{

   res.send({post:result})


   }).catch((err)=>{

    res.send(err);

   })


})




module.exports= router;