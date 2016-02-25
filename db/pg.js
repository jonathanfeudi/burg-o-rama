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
    var query = client.query("INSERT INTO orders (name, meatid, bunid, temperature) VALUES ($1, $2, $3, $4);", [req.body.name, req.body.meat, req.body.bun, req.body.temperature], function(err, result){
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
    var query = client.query("SELECT orderid FROM orders ORDER BY orderid desc LIMIT 1;", function(err, result){
      done()
      if(err){
        return console.error('error running query', err)
      }
      if (result.rows.length === 0){
        res.status(204).json({success: true, data: 'no content'})
      } else {
        req.body.order_id = result.rows[0].orderid;
        console.log(req.body.order_id);
        next()
      }
    })
  })
};

function addToppings(req, res, next){
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    if (req.body.extras){
    for (var i = 0; i < req.body.extras.length; i++){
      var query = client.query("INSERT INTO order_topping (orderid, toppingid) VALUES ($1, $2);", [req.body.order_id, req.body.extras[i]], function(err, result){
        if(err){
          return console.error('error running query', err)
        }
      }
    )}
  }
      done()
      next()
  })
};

function addCheeses(req, res, next){
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    if (req.body.cheese){
    for (var i = 0; i < req.body.cheese.length; i++){
      var query = client.query("INSERT INTO order_cheese (orderid, cheeseid) VALUES ($1, $2);", [req.body.order_id, req.body.cheese[i]], function(err, result){
        if(err){
          return console.error('error running query', err)
        }
      }
    )}
  }
      done()
      next()
  })
};

function getBurger(req, res, next){
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    var ID = req.params.burgerID;
    var query = client.query("SELECT justCheese.orderid, meat_type, bun_type, cheeses, array_agg(t.type) as toppings FROM (SELECT o.orderid, meat.type as meat_type, bun.type as bun_type, array_agg(c.type) as cheeses FROM orders o INNER JOIN meat ON o.meatid = meat.meatid LEFT JOIN bun ON o.bunid = bun.bunid INNER JOIN order_cheese oc ON o.orderid = oc.orderid LEFT JOIN cheese c ON c.cheeseid = oc.cheeseid GROUP BY (o.orderid, meat.type, bun.type) ORDER BY o.orderid) AS justCheese INNER JOIN order_topping ot ON justCheese.orderid = ot.orderid LEFT JOIN topping t ON t.toppingid = ot.toppingid WHERE justCheese.orderid = "+"'"+ID+"'"+" GROUP BY justCheese.orderid, meat_type, bun_type, cheeses ORDER BY justCheese.orderid;", function(err, result){
      done()
      if(err){
        return console.error('error running query', err)
      }
      if (result.rows.length === 0){
        res.status(204).json({success: true, data: 'no content'})
      } else {
        res.rows = result.rows[0]
        console.log(res.rows)
        next()
      }
    })
  })
};

function deleteBurger(req, res, next){
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    var ID = req.params.burgerID;
    var query = client.query("DELETE FROM orders WHERE orderid = "+"'"+ID+"'", function(err, result){
      done()
      if(err){
        return console.error('error running query', err)
      }
      if (result.rows.length === 0){
        res.status(204).json({success: true, data: 'no content'})
      } else {
        next()
      }
    })
  })
};

module.exports.deleteBurger = deleteBurger;
module.exports.getBurger = getBurger;
module.exports.addToppings = addToppings;
module.exports.addCheeses = addCheeses;
module.exports.getOrderID = getOrderID;
module.exports.createOrder = createOrder;
module.exports.loginUser = loginUser;
module.exports.createUser = createUser;
module.exports.createSecure = createSecure;
