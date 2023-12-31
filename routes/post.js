const express= require("express")
const router = express.Router() 
const mongoose= require("mongoose")
const requireLogin = require("../middleware/requireLogin")
const Post= mongoose.model("Post")


router.get("/allpost",requireLogin,(req,res)=>{


    Post.find().populate("postedBy","_id name").then(posts=>{

    res.send({posts})

    }).catch((err)=>{

        res.send(err);
    })




})


router.get("/myposts",requireLogin,(req,res)=>{
 
    Post.find({postedBy:req.user._id}).populate("PostedBy","_id name").then(myposts=>{

    res.json({myposts});


    }).catch((err)=>{

   res.send(err);


    })   






})


router.post('/createPost',requireLogin,(req,res)=>{
    const {title,body,pic} = req.body 
    if(!title || !body || !pic){
      return  res.status(422).json({error:"Plase add all the fields"})
    }
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})


router.put("/like",requireLogin,(req,res)=>{

Post.findByIdAndUpdate(req.body.postId,{
    
$push:{
    likes:req.user._id
},new:true // if we dont write this then mongodb will return old record

}).exec((err,result)=>{

    if(err){
        res.status(422).json({error:err})
    }

    else{
        res.json(result)
    }

})




})

router.put("/unlike",requireLogin,(req,res)=>{

    Post.findByIdAndUpdate(req.body.postId,{
    
    $pull:{
        likes:req.user._id
    },new:true // if we dont write this then mongodb will return old record
    
    }).exec((err,result)=>{
    
        if(err){
            res.status(422).json({error:err})
        }
    
        else{
            res.json(result)
        }
    
    })
    
    
    
    
    })



    router.put('/comment',requireLogin,(req,res)=>{
        const comment = {
            text:req.body.text,
            postedBy:req.user._id
        }
        Post.findByIdAndUpdate(req.body.postId,{
            $push:{comments:comment}
        },{
            new:true
        })
        .populate("comments.postedBy","_id name")
        .populate("postedBy","_id name")
        .exec((err,result)=>{
            if(err){
                return res.status(422).json({error:err})
            }else{
                res.json(result)
            }
        })
    })

router.delete("/deletepost/:postId",requireLogin,(req,res)=>{

   Post.findOne({_id:req.params.postId})
   .populate("postedBy","_id")
   .exec((err,post)=>{

         if(err||!post)
         {
             return res.status(422).json({error:err})
         }
         if(post.postedBy._id.toString() === req.user._id.toString()){

             post.remove()
             .then(result=>{

                res.json(result)
             }).catch(err=>{
                 console.log(err);
             })

         }


   })

})    
      

router.delete("/deletecomment/:postId/:commentId",requireLogin,(req,res)=>{

    const comment={_id:req.params.commentId}


    Post.findByIdAndUpdate(req.params.postId,{
    
        $pull:{
            comments:comment
        },new:true,
        // if we dont write this then mongodb will return old record
        
        }).populate("comments.postedBy","_id name")
        .populate("postedBy","_id name")
        .exec((err,result)=>{
        
            if(err ||!result){
                res.status(422).json({error:err})
            }
        
            else{
                console.log(result);
                res.json(result)
            }
        
        })
        
 
 })    


 router.get('/getsubscribedpost',requireLogin,(req,res)=>{

    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

    


module.exports= router;