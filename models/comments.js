const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    likes:{
        type:Number,
        validate(c){
            if(c<0){
                this.likes=0
            }
        }

    },
    unlikes:{
        type:Number,
        validate(c){
            if(c<0){
                this.unlikes=0
            }
        }

    },
    date:{
        type:Date,
        required:true
    },
    blog_info:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Blog'
    }
})




 const Comments =mongoose.model('comments',commentSchema)

 module.exports=Comments