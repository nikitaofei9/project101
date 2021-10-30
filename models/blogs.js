const mongoose = require('mongoose')
const comments = require('./comments')
const BlogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    blog:{
        type:String,
        required:true
    },
    blogComments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'comments'
        }
    ]
})


BlogSchema.pre('remove',async function(next){
    await comments.deleteMany({creator:this._id})
    next()
  })

const Blogs = mongoose.model('Blog',BlogSchema)

module.exports= Blogs