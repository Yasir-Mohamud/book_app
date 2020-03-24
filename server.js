'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');
require('dotenv').config();
const ejs = require('ejs');
const PORT = process.env.PORT || 3001;

/////////// MIDDLEWARE ////////
// tells express that we are using ejs as our templating system
app.set('view engine', 'ejs');
// parses our request.body so that we can read form data when it comes in
app.use(express.urlencoded({extended:true}));
// serve my static files from my public directory
app.use(express.static('./public'));

app.get('/bananas' , (request,response) => {
  response.render('pages/searches/new.ejs')
})

app.post('/searches' , (request,response) => {
  console.log('hello',request.body);
  let searchItem = request.body.search[0];
  let titleorauthor = request.body.search[1];
  let url  = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (titleorauthor === 'title') {
    url+=`+intitle:${searchItem}`
  } else if (titleorauthor === 'author') {
    url+=`+inauthor:${searchItem}`
  }
  superagent(url)
    .then( superagentResults => {
      console.log(superagentResults.body.items[0].volumeInfo)
      let bookArr = superagentResults.body.items;
      let finalBookArr = bookArr.map(book => {
        return new Book (book.volumeInfo, book.imageLinks);
      })
      response.send(finalBookArr.slice(0,10));
    })

})

////// google api book ///////

function Book (obj) {
  this.img = 
  this.authors = obj.authors;
  this.title = obj.title;
  this.description = obj.description;

}


app.get('/' , (request,response) => {
  response.render('pages/index.ejs')
})

app.listen( PORT, () => {
  console.log(`listening on port ${PORT}`);
});
