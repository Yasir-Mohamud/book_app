/* eslint-disable no-unused-vars */
'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');
require('dotenv').config();
const ejs = require('ejs');
const pg = require('pg');
const client = new pg.Client (process.env.DATABASE_URL);
const PORT = process.env.PORT || 3001;

/////////// MIDDLEWARE ////////
// tells express that we are using ejs as our templating system
app.set('view engine', 'ejs');
// parses our request.body so that we can read form data when it comes in
app.use(express.urlencoded({extended:true}));
// serve my static files from my public directory
app.use(express.static('./public'));


app.get('/' , renderHomePage) ;
app.get('/searches/new' , renderSearchPage)
app.post('/searches' , renderSearchBooksPage)
app.post('/add', renderAddPage)
app.post('/books', saveToDatabase)
app.get('/books/:id' , renderDetailsPage)



function renderHomePage(request, response){

  let sql = 'SELECT * FROM books';
  console.log('home',sql)
  client.query(sql)
    .then(results =>{
      let books = results.rows;
      let number0fBooks = books.length;
      console.log(number0fBooks)

      response.render('./pages/index.ejs', {bookArray: books, number0fBooks});
    })
    .catch(error =>{
      Error(error, response);
    });
}



function renderSearchPage (request,response){
  response.render('pages/searches/new.ejs')
}

function renderSearchBooksPage (request,response) {
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
      let bookArr = superagentResults.body.items;


      let finalBookArr = bookArr.map(book => {

        return new Book (book.volumeInfo);
      })

      response.render('./pages/searches/show.ejs', { books :finalBookArr.slice(0,10)});
    })

}

////// google api book ///////
// ? obj.imageLinks.thumbnail :`https://via.placeholder.com/150`;
function Book (obj) {
  this.image_url = obj.imageLinks.smallThumbnail;
  this.authors = (obj.authors) ? obj.authors:'no author found';
  this.title = (obj.title) ? obj.title:'no title found';
  this.description = (obj.description) ? obj.description:'no description found';
  this.isbn = obj.industryIdentifiers[0].identifier;
}

function renderAddPage(request,response) {
/// saves the books to the database
  let newArr = [];
  let book = request.body;
  newArr.push(book)

  response.render('./pages/searches/add.ejs', { selected :newArr});
}

function saveToDatabase(request,response) {
  let{title,authors,isbn,image_url,description,bookshelf} = request.body;
  let sql = 'INSERT INTO books (title ,authors, isbn ,image_url ,description, bookshelf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id;';
  let safeValues = [title,authors,isbn,image_url,description,bookshelf];
  return client.query(sql,safeValues)
    .then(results => {
      let id = results.rows[0].id;
      response.redirect(`/books/${id}`)
    })
}


function renderDetailsPage(request , response) {
  let bookID = request.params.id;
  let sql = 'SELECT * FROM books WHERE id=$1;'
  let safeValues = [bookID];
  client.query(sql,safeValues)
    .then (results => {
      let selectedBook = results.rows;
      response.render('./pages/books/show.ejs' , {oneBook : selectedBook})
    })
}





client.connect()
  .then (() => {
    app.listen( PORT, () => {
      console.log(`listening on port ${PORT}`);
    });
  })

