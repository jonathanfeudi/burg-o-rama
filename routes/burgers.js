'use strict'
var express = require('express');
var burgers = express.Router();
var burgerData = [];
var db = require('../db/pg');
var session = require('express-session');
var pgSession = require('connect-pg-simple');


// burgers route (collection)
burgers.route('/')
  .get((req,res)=>res.render('pages/burgers_all'))
  .post(db.createOrder, db.getOrderID, db.addCheeses, db.addToppings, function(req, res){
    var newID = req.body.order_id;
    res.redirect('./burgers/'+ newID)
  });

burgers.get('/new', function(req, res){
  res.render('pages/burger_edit')
});

burgers.route('/:burgerID')
  .get(db.getBurger, function(req, res){
    console.log(req.params.burgerID)
    res.send(res.rows);
    // res.render('pages/burger_one')
  })
  .put(function(req, res){
    if(!(req.params.burgerID in burgerData)){
      res.sendStatus(404);
      return;
    }
    burgerData[req.params.burgerID] = req.body;
    res.redirect('./' + req.params.burgerID)
  })
  .delete(db.deleteBurger, function(req, res){
    res.redirect('/home');
  })

burgers.get('/:burgerID/edit', function(req, res){
  res.render('pages/burger_edit')
});


module.exports = burgers;
