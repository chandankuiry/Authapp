var express = require('express');
var app=express();
var bodyParser= require('body-parser');
var jwt=require('jsonwebtoken');
var Jimp = require("jimp");
var fs = require("fs")
var morgan = require('morgan');
//data for authenticate
var users=[
{
  name:"chandan@gmail.com",
  password:"123",
  imgURL:"https://ichef.bbci.co.uk/news/660/cpsprodpb/37B5/production/_89716241_thinkstockphotos-523060154.jpg"
},
{
  name:"c@gmail.com",
  password:"123",
  imgURL:"https://ichef.bbci.co.uk/news/660/cpsprodpb/37B5/production/_89716241_thinkstockphotos-523060154.jpg"
}
]
app.use(morgan('dev')); // log every request to the console
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('./'));
// for frontened code index.html file 
app.get('/', (req,res)=>{
    res.sendFile('index.html');
});
// login code through users data
app.post('/login',(req,res)=>{
    var message;
    for(var user of users){
      if(user.name!=req.body.name){
          message="Wrong Name";
      }else{
          if(user.password!=req.body.password){
              message="Wrong Password";
              break;
          }
          else{
              //here we use jwt to generate token and we pass the user data and secret value for encoding
              var token=jwt.sign(user,"samplesecret");
              console.log(token);
              message="Login Successful";
              break;
          }
      }
    }
    if(token){
        res.status(200).json({
            message,
            token
        });
    }
    else{
        res.status(403).json({
            message
        });
    }
});

app.use((req, res, next)=>{
        // check header or url parameters or post parameters for token
        console.log(req.body);
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if(token){
          console.log("token");
          //here we verify the token after decoding .For decoding we pass the same secret value 
          jwt.verify(token,"samplesecret",(err,decod)=>{
            if(err){
              res.status(403).json({
                message:"Wrong Token"
              });
            }
            else{
              console.log("success");
              req.decoded=decod;
              next();
            }
          });
        }
        else{
          res.status(403).json({
            message:"No Token"
          });
        }
});
// for convert image we use jimp package 
app.post('/getImage',(req,res)=>{
    var user_list=[];
    // here we get the data after decoding the token
    var DataOftoken=req.decoded
    // here we are getting the image url from the decoded token 
    var imgURL=DataOftoken.imgURL
    // now we resize the image using jimp into 50*50 pix
    Jimp.read(imgURL, function(err,img){
      if (err) throw err;
      img.resize(50, 50).getBase64( Jimp.AUTO , function(e,img64){
          if(e)throw e
          //here we getting the base64 image url in img64
          res.send('<img src="'+img64+'">')
          console.log('image',img64)
          //now we convert the base64 to image file and save into convertThumbs/image.png file 
          const base64Image = img64.split(';base64,').pop();
          fs.writeFile('convertThumbs/image.png', base64Image, {encoding: 'base64'}, function(err) {
            if(err){
              throw err
            }
            else{
              console.log('file created and save image as 50*50 pix');
            }
          });

      });
    });
    
    console.log("here");
});

app.listen(3000, function(){
  console.log('listening on port 3000');
});