const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Jimp = require('jimp');
const fs = require('fs');
const morgan = require('morgan');
// data for authenticate
const users = [
  {
    name: 'chandan@gmail.com',
    password: '123',
    imgURL: 'https://ichef.bbci.co.uk/news/660/cpsprodpb/37B5/production/_89716241_thinkstockphotos-523060154.jpg',
  }
];
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(express.static('./'));
// for frontened code index.html file
app.get('/', (req, res) => {
  res.sendFile('index.html');
});
// login code through users data
app.post('/login', (req, res) => {
  const message;//eslint-disable-line use const
  for (const user of users) {
    if (user.name != req.body.name) {
      message = 'Wrong Name';
    } else if (user.password != req.body.password) {
      message = 'Wrong Password';
      break;
    } else {
      // here we use jwt to generate token and we pass the user data and secret value for encoding
      var token = jwt.sign(user, 'samplesecret');
      console.log(token);
      message = 'Login Successful';
      break;
    }
  }
  if (token) {
    res.status(200).json({
      message,
      token,
    });
  } else {
    res.status(403).json({
      message,
    });
  }
});

app.use((req, res, next) => {
  // check header or url parameters or post parameters for token
  console.log(req.body);
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    console.log('token');
    // here we verify the token after decoding .For decoding we pass the same secret value
    jwt.verify(token, 'samplesecret', (err, decod) => {
      if (err) {
        res.status(403).json({
          message: 'Wrong Token',
        });
      } else {
        console.log('success');
        req.decoded = decod;
        next();
      }
    });
  } else {
    res.status(403).json({
      message: 'No Token',
    });
  }
});
// for convert image we use jimp package
app.post('/getImage', (req, res) => {
  const user_list = [];
  // here we get the data after decoding the token
  const DataOftoken = req.decoded;
  // here we are getting the image url from the decoded token
  const imgURL = DataOftoken.imgURL;
  // now we resize the image using jimp into 50*50 pix
  Jimp.read(imgURL, (err, img) => {
    if (err) throw err;
    img.resize(50, 50).getBase64(Jimp.AUTO, (e, img64) => {
      if (e) throw e;
      // here we getting the base64 image url in img64
      res.send(`<img src="${img64}">`);
      console.log('image', img64);
      // now we convert the base64 to image file and save into convertThumbs/image.png file
      const base64Image = img64.split(';base64,').pop();
      fs.writeFile('convertThumbs/convertImage.png', base64Image, { encoding: 'base64' }, (err) => {
        if (err) {
          throw err;
        } else {
          console.log('file created in convertThumbs folder and save image as 50*50 pix');
        }
      });
    });
  });

  console.log('here');
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});
