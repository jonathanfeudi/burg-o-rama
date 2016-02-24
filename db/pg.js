var pg = require('pg');
var connectionString = "postgres://Feudimonster:"+process.env.DB_PASSWORD+"@localhost/burgerdb";
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var session = require('express-session');

function loginUser(req,res,next) {
  var email = req.body.email;
  var password = req.body.password;
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    var query = client.query("SELECT * FROM users WHERE email LIKE ($1);", [email], function(err, result){
      done()
      if(err){
        return console.error('error running query', err)
      }
      if (result.rows.length === 0){
        res.status(204).json({success: true, data: 'no content'})
      } else if (bcrypt.compareSync(password, result.rows[0].password_digest)){
        res.rows = result.rows[0]
        next()
      }
    })
  })
}

function createSecure(email, password, callback) {
  //hashing the password given by user
  bcrypt.genSalt(function(err, salt){
    bcrypt.hash(password, salt, function(err, hash){
      //callback saves the email and hashed password to DB
      callback(email, hash)
    })
  })
};


function createUser(req, res, next) {
  createSecure(req.body.email, req.body.password, saveUser);
  function saveUser(email, hash){
    pg.connect(connectionString, function(err, client, done){
      if(err){
        done()
        console.log(err)
        return res.status(500).json({success: false, data: err})
      }
      var query = client.query("INSERT INTO users (email, password_digest) VALUES ($1, $2);", [email, hash], function(err, result){
        done()
        if(err){
          return console.error('error running query', err)
        }
        next()
      })
    })
  }
};

function createOrder(req, res, next){
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    var query = client.query("INSERT INTO orders (name, meat_id, bun_id, temperature) VALUES ($1, $2, $3, $4);", [req.body.name, req.body.meat, req.body.bun, req.body.temperature], function(err, result){
      done()
      if(err){
        return console.error('error running query', err)
      }
      next()
    })
  })
};

function getOrderID(req, res, next){
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    var query = client.query("SELECT order_id FROM orders ORDER BY order_id desc LIMIT 1;", function(err, result){
      done()
      if(err){
        return console.error('error running query', err)
      }
      if (result.rows.length === 0){
        res.status(204).json({success: true, data: 'no content'})
      } else {
        req.body.order_id = result.rows[0].order_id;
        next()
      }
    })
  })
};

function addCheeses(req, res, next){
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    for (var i = 0; i < req.body.cheese.length; i++){
      var query = client.query("INSERT INTO cheeses_orders_join (order_id, cheese_id) VALUES ($1, $2);", [req.body.order_id, req.body.cheese[i]], function(err, result){
        if(err){
          return console.error('error running query', err)
        }
      }
    )}
      done()
      next()
  })
};

module.exports.addCheeses = addCheeses;
module.exports.getOrderID = getOrderID;
module.exports.createOrder = createOrder;
module.exports.loginUser = loginUser;
module.exports.createUser = createUser;
module.exports.createSecure = createSecure;
