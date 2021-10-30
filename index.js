const express = require("express");
const app = express();
const userData = require("./MOCK_DATA.json");
const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  buildSchema,
} = graphql;
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

const Comments = require('./models/comments')
const Blogs = require('./models/blogs')
const comments=[]



app.use(express.json());



const comment = commentId=>{
    return Comments.find({_id: {$in : commentId}}).then((i=>{
        
        return i.map(g=>{
            return {...g._doc,
                date:new Date(g._doc.date).toISOString(),
                blog_info:blog.bind(this,g.blog_info)}
        })
    })).catch((err)=>{
        throw err
    })
}


const blog= blogId=>{
    return Blogs.findById(blogId).then((i)=>{
        return {...i._doc,blogComments:comment.bind(this,i._doc.blogComments)}
    }).catch((err)=>{throw err})
}
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
    type Comment{
        _id:ID!
        text:String!
        date:String!
        likes:Int
        unlikes:Int
        blog_info:Blog!

    }


    type Blog{
        _id:ID!
        title:String!
        author:String!
        age:Int!
        blog:String!
        blogComments:[Comment!]

    }

    
    input Binput{
        title:String!
        author:String!
        age:Int!
        blog:String!
    }

    input Cinput{
        text:String!,
        date:String,
        blogId:ID!
     
    }

    type RootQuery {
        comments: [Comment!]!
        blogs: [Blog!]!
    }
    type RootMutation {
        createComment(Cinput:Cinput):Comment
        createBlog(Binput:Binput):Blog
        deleteComment(commentId: ID!): Comment!
        deleteBlog(blogId: ID!): Blog!
        updateBlog(blogId: ID!,blog: String!): Blog!
        likeComment(commentId: ID!):Comment!
        unlikeComment(commentId: ID!):Comment!
    }
    schema {
        query: RootQuery,
        mutation:RootMutation
    }
    `),
    rootValue: {
      comments: async () => {
      
        try{
         const b = await Comments.find()
         return b.map(g=>{
            return {
                ...g._doc,
                date:new Date(g._doc.date).toISOString(),
                blog_info:blog.bind(this,g._doc.blog_info)
            }
        })

 
        }
        catch(err){
            console.log(err)
        }
      
      },

      blogs: async () => {
      
        try{
         const b = await Blogs.find()
         return b.map(g=>{
            return {
                ...g._doc,
               
                blogComments:comment.bind(this,g._doc.blogComments)
            }
        })

     
        }
        catch(err){
            console.log(err)
        }
      
      },



      createComment: async (args) => {
     
        const comment = new Comments({
                text: args.Cinput.text,
          date: Date.now(),
            likes:0,
            unlikes:0,
          blog_info:args.Cinput.blogId
        })
        let blog_create
        return comment.save().then(async (i)=>{
             blog_create={...i._doc,
                date:new Date(i._doc.date).toISOString(),
                blog_info:blog.bind(this,i._doc.blog_info)}
             const Blog = await Blogs.findById(args.Cinput.blogId)
             if(!Blog){
                 throw new Error('no blog found')
             }
             
                     Blog.blogComments.push(comment)
                    await Blog.save()
                    return blog_create
                    
             
     
        }
        ).catch((err)=>{
            console.log(err)
            throw err
        })
      
          

  

        
      },

      createBlog : async (args)=>{
        const blog = new Blogs({
            title:args.Binput.title,
            author:args.Binput.author,
            age:args.Binput.age,
            blog:args.Binput.blog
        })
        try{
            const a = await blog.save()
            return a
        }
        catch(err){
            console.log(er)
        }
       
      },

      deleteComment : async(args)=>{
          try{
              const g = await Comments.findById(args.commentId)
              const c = {
                ...g._doc,
                date:new Date(g._doc.date).toISOString(),
                blog_info:blog.bind(this,g._doc.blog_info)
              }
              await Comments.deleteOne({_id:args.commentId})

              return c

          }
          catch(err){
            throw err
          }
      },
      deleteBlog  : async (args)=>{
          try{
            const g = await Blogs.findById(args.blogId)
            const c = {
                ...g._doc,
                
                blog_info:blog.bind(this,g._doc.blog_info)
              }
            await g.remove()
            return c

          }
          catch(err){
              throw err
          }
      },
      updateBlog  : async (args)=>{
        try{
          const g = await Blogs.findByIdAndUpdate(args.blogId,{
              blog:args.blog
          },{
              new:true,
              runValidators:true
          })
          const c = {
              ...g._doc,
              
              blog_info:blog.bind(this,g._doc.blog_info)
            }
        
          return c

        }
        catch(err){
            throw err
        }
    },
      likeComment : async (args)=>{
        try{
            const g1 = await Comments.findById(args.commentId)
            console.log(g1.likes)
            const g = await Comments.findByIdAndUpdate(args.commentId,{
                likes:g1.likes+1
                //617c146415c2fca914e795ed
            },{
                new:true,
                runValidators:true
              })
            return {
                ...g._doc,
                
                blog_info:blog.bind(this,g._doc.blog_info)
            }
        }
        catch(err){
            throw err

        }
      },
      unlikeComment : async (args)=>{
        try{
            const g1 = await Comments.findById(args.commentId)
           
            const g = await Comments.findByIdAndUpdate(args.commentId,{
                unlikes:g1.unlikes+1
              
            },{
                new:true,
                runValidators:true
              })
            return {
                ...g._doc,
                
                blog_info:blog.bind(this,g._doc.blog_info)
            }
        }
        catch(err){
            throw err

        }
      },

    },
    graphiql: true,
  })
);

mongoose
  .connect(
    "mongodb://127.0.0.1:27017/graphql", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
}
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("running");
    });
  })
  .catch((err) => {
    console.log(err);
  });
