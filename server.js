//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan');

var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var crypto = require('crypto');


Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({secret: "CodaLoginSecret"}));


app.use("/resources",express.static(__dirname + "/resources"));
app.use("/bootstrapresources",express.static(__dirname + "/bootstrapresources"));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
	res.render('index.html', {});
});

/* Customer Pages*/

app.get('/customer/dashboard', function (req, res) {
   	if(!req.session.userlogin){
   	    res.render('customer/login',{});
     }else{
    	 res.render('customer/dashboard',{currentUserName: req.session.username});
     }
});

app.get('/hotelmanager/dashboard', function (req, res) {
   	if(!req.session.managerlogin){
   	    res.render('hotelmanager/login',{});
     }else{
    	 res.render('hotelmanager/dashboard',{currentUserName: req.session.managername});
     }
});



app.get('/customer/bookings', function (req, res) {
   	if(!req.session.userlogin){
   	    res.render('customer/login',{ });
     }else{
    	 res.render('customer/bookings',{currentUserName: req.session.username});
     }
});

app.get('/hotelmanager/bookings', function (req, res) {
   	if(!req.session.managerlogin){
   	    res.render('hotelmanager/login',{ });
     }else{
    	 res.render('hotelmanager/bookings',{currentUserName: req.session.managername});
     }
});

app.get('/customer/login', function (req, res) {
    res.render('customer/login',{ });
});

app.get('/customer/logout', function (req, res) {
	req.session.userlogin = false;
    req.session.username = -1;
    res.render('customer/login',{ });
});

app.get('/hotelmanager/logout', function (req, res) {
	req.session.managerlogin = false;
    req.session.managername = -1;
    res.render('hotelmanager/login',{ });
});

app.get('/customer/registration', function (req, res) {
    res.render('customer/registration',{});
});


/* hotelmanager Pages*/

app.get('/hotelmanager/login', function (req, res) {
    res.render('hotelmanager/login',{ });
});

/*Admin UI page */
app.get('/admin/addhotel', function (req, res) {
    res.render('admin/addhotel',{ });
});


/*APIs.. Need to be authenticated.*/

/// From admin page
app.post('/api/addhotel', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    if (db) {     
        db.collection('hotels').findOne(
                { name: req.body.hotel },
                function (err, user) {
                    if (err){
                  	   res.send('{ "failure" : "true"}');
                    }
                    if (user) {
                  	   res.send('{ "failure" : "true"}');
                    } else {
                        var col = db.collection('hotels');
                    	var hashedPassword = crypto.createHash('md5').update(req.body.password).digest('hex');
                    	console.log(hashedPassword);	
                        col.insert({name: req.body.hotel, username: req.body.username,password: hashedPassword});
                    	res.send('{ "success" : "true"}');
                    }
                });
      } else {
    	   res.send('{ "failure" : "true"}');
     }
});


app.get('/api/reservedseatsforhotel', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    db.collection('bookedseats', function(err, collection) {
        if (!err) {
          collection.find({
            'hotel': req.session.hotel
          }).toArray(function(err, hotel) {
            if (!err) {

              var reservedSeatsCount = hotel.length;
              var strJson = "[";
              
              if (reservedSeatsCount > 0) {
                for (var i = 0; i < reservedSeatsCount;) {
                  strJson += '"' + hotel[i].seat + '"';
                  i = i + 1;
                  if (i < reservedSeatsCount) {
                    strJson += ',';
                  }
                }
              }
              strJson += ']';
              res.send(strJson);
            
            } else {
            	
            }
          });  
        } else {
        }
      }); 
});

app.get('/api/reservedseats/:hotel', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    db.collection('bookedseats', function(err, collection) {
        if (!err) {
        	console.log('bookedseats....');
            
          collection.find({
            'hotel': req.params.hotel
          }).toArray(function(err, hotel) {
            if (!err) {

              var reservedSeatsCount = hotel.length;
              var strJson = "[";
              
              if (reservedSeatsCount > 0) {
                for (var i = 0; i < reservedSeatsCount;) {
                  strJson += '"' + hotel[i].seat + '"';
                  i = i + 1;
                  if (i < reservedSeatsCount) {
                    strJson += ',';
                  }
                }
              }
              strJson += ']';
              res.send(strJson);
            
            } else {
            	
            }
          });  
        } else {
        }
      }); 
});

// select * from hotels
app.get('/api/hotels', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    db.collection('hotels', function(err, collection) {
        if (!err) {
        	console.log('hotels....');
            
          collection.find({
          }).toArray(function(err, hotel) {
            if (!err) {
              var reservedSeatsCount = hotel.length;
              var strJson = "[";
              
              if (reservedSeatsCount > 0) {
                for (var i = 0; i < reservedSeatsCount;) {
                  strJson += '"' + hotel[i].name + '"';
                  i = i + 1;
                  if (i < reservedSeatsCount) {
                    strJson += ',';
                  }
                }
              }
              strJson += ']';
              res.send(strJson);
            
            } else {
            	
            }
          });  
        } else {
        }
      }); 
});

app.get('/api/mybookings', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    db.collection('bookedseats', function(err, collection) {
        if (!err) {
        	console.log('bookedseats....');
            
          collection.find({
              'user': req.session.username
          }).toArray(function(err, hotel) {
            if (!err) {
              var reservedSeatsCount = hotel.length;
              var strJson = "[";
              
              if (reservedSeatsCount > 0) {
                for (var i = 0; i < reservedSeatsCount;) {
                  strJson += '{"user":"' + hotel[i].user + '","seat":"' + hotel[i].seat + '","hotel":"' + hotel[i].hotel + '"}';
                  i = i + 1;
                  if (i < reservedSeatsCount) {
                    strJson += ',';
                  }
                }
              }
              strJson += ']';
              res.send(strJson);
            
            } else {
            	
            }
          });  
        } else {
        }
      }); 
});


app.get('/api/allbookings', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    db.collection('bookedseats', function(err, collection) {
        if (!err) {
          collection.find({
              'hotel': req.session.hotel
          }).toArray(function(err, hotel) {
            if (!err) {
              var reservedSeatsCount = hotel.length;
              var strJson = "[";
              
              if (reservedSeatsCount > 0) {
                for (var i = 0; i < reservedSeatsCount;) {
                  strJson += '{"user":"' + hotel[i].user + '","seat":"' + hotel[i].seat + '","hotel":"' + hotel[i].hotel + '"}';
                  i = i + 1;
                  if (i < reservedSeatsCount) {
                    strJson += ',';
                  }
                }
              }
              strJson += ']';
              res.send(strJson);
            
            } else {
            	
            }
          });  
        } else {
        }
      }); 
});


app.post('/api/bookseatforhotel', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    if (db) {     
    	var hotel = req.session.hotel;
    	var user = req.session.managername;
    	var seats = req.body['seats[]'];
    	console.log('seats....'+seats);
        console.log('user....'+user);
        for (var key in seats) {
            var col = db.collection('bookedseats');
        	col.insert({seat: seats[key], hotel: hotel,user: user});
            console.log("key: %o, value: %o", key, seats[key])
        }
        res.send('{ updated : true }');
      } else {
          res.send('{ updated : false }');
     }
    
    
    
});
app.post('/api/bookseat', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    if (db) {     
    	var hotel = req.body.hotel;
    	var user = req.session.username;
    	
    	var seats = req.body['seats[]'];
    	console.log('seats....'+seats);
        console.log('user....'+user);
        for (var key in seats) {
            var col = db.collection('bookedseats');
        	col.insert({seat: seats[key], hotel: hotel,user: user});
            console.log("key: %o, value: %o", key, seats[key])
        }
        res.send('{ updated : true }');
      } else {
          res.send('{ updated : false }');
     }
    
    
    
});


/* Login & Registration */

app.post('/api/customerlogin', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    if (db) {     
        console.log('Logging in with user....'+req.body.username);
        var hashedPassword = crypto.createHash('md5').update(req.body.password).digest('hex');
        console.log(hashedPassword);	
        db.collection('customers').findOne(
                { username: req.body.username ,password: hashedPassword },
                function (err, user) {
                    if (err){
                    	   res.send('{ "failure" : "true"}');
                    }
                    if (user) {
                    	if(!req.session.userlogin){
                    		req.session.userlogin = true;
                    		req.session.username = req.body.username;
                	     }
                 	   res.send('{ "success" : "true"}');
                    } else {
                 	   res.send('{ "failure" : "true"}');
                    }
                });
      } else {
   	   res.send('{ "failure" : "true"}');
     }
});

app.post('/api/hotelmanagerlogin', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    if (db) {     
        var hashedPassword = crypto.createHash('md5').update(req.body.password).digest('hex');
        db.collection('hotels').findOne(
                { name: req.body.hotel,username: req.body.username ,password: hashedPassword },
                function (err, user) {
                    if (err){
                    	   res.send('{ "failure" : "true"}');
                    }
                    if (user) {
                    	if(!req.session.managerlogin){
                    		req.session.managerlogin = true;
                    		req.session.managername = req.body.username;
                    		req.session.hotel = req.body.hotel;

                	     }
                 	   res.send('{ "success" : "true"}');
                    } else {
                 	   res.send('{ "failure" : "true"}');
                    }
                });
      } else {
   	   res.send('{ "failure" : "true"}');
     }
});

app.post('/api/customerregistration', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    if (db) {     
        db.collection('customers').findOne(
                { username: req.body.username },
                function (err, user) {
                    if (err){
                  	   res.send('{ "failure" : "true"}');
                    }
                    if (user) {
                  	   res.send('{ "failure" : "true"}');
                    } else {
                        var col = db.collection('customers');
                    	var hashedPassword = crypto.createHash('md5').update(req.body.password).digest('hex');
                    	console.log(hashedPassword);	
                        col.insert({fullname: req.body.fullname, username: req.body.username,password: hashedPassword});
                    	if(!req.session.userlogin){
                    		req.session.userlogin = true;
                    		req.session.username = req.body.username;
                	     }

                  	   res.send('{ "success" : "true"}');
                    }
                });
      } else {
    	   res.send('{ "failure" : "true"}');
     }
});



app.get('/pagecount', function (req, res) {
	  if (!db) {
	    initDb(function(err){});
	  }
	  if (db) {
	    db.collection('counts').count(function(err, count ){
	      res.send('{ pageCount: ' + count + '}');
	    });
	  } else {
	    res.send('{ pageCount: -1 }');
	  }
	});


// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
