'use strict';
const express = require('express');
const app = express();
require('dotenv').config();
const ejs = require('ejs');
const PORT = process.env.PORT || 3001;
console.log('app',app)

/////////// MIDDLEWARE ////////
// tells express that we are using ejs as our templating system
app.set('view engine', 'ejs');
// serve my static files from my public directory
app.use(express.static('./public'));

app.get('/' , (request,response) => {
  response.render('pages/index.ejs')
})
console.log(PORT)
app.listen( PORT, () => {
  console.log(`listening on port ${PORT}`);
})
