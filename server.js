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

app.get('/userlogin', function (req, res) {
	res.render('user/login.html', {});
});

app.get('/useroldlogin', function (req, res) {
	res.render('user/oldlogin.html', {});
});

app.get('/customer/dashboard', function (req, res) {
    res.render('customer/dashboard',{ error : null,success:null});
});

app.get('/customer/login', function (req, res) {
    res.render('customer/login',{ error : null,success:null});
});

app.post('/customer/login', function (req, res) {
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
                        res.render('customer/login', { error : 1,success:null});
                    }
                    if (user) {
                    	//Should be redirected to homepage..
                        res.render('customer/login', { error : null,success:1});
                    } else {
                    	res.render('customer/login', { error : 1,success:null});
                    }
                });
      } else {
        res.render('customer/login', { error : 1,success:null});
     }
});

app.get('/customer/registration', function (req, res) {
    res.render('customer/registration',{ error : null,success:null});
});



app.post('/customer/registration', function (req, res) {
	if (!db) {
		initDb(function(err){});
	}
	
    if (db) {     
        console.log('Going to Registering User with username....'+req.body.username);

        db.collection('customers').findOne(
                { username: req.body.username },
                function (err, user) {
                    if (err){
                        res.render('customer/registration', { error : 1,success:null});
                    }
                    if (user) {
                        console.log('Username ' + req.body.username + ' is already taken');
                        res.render('customer/registration', { error : 1,success:null});
                    } else {
                        var col = db.collection('customers');
                    	var hashedPassword = crypto.createHash('md5').update(req.body.password).digest('hex');
                    	console.log(hashedPassword);	
                        col.insert({fullname: req.body.fullname, username: req.body.username,password: hashedPassword});
                        res.render('customer/registration', { error : null,success:1});
                    }
                });
      } else {
        res.render('customer/registration', { error : 1,success:null});
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

app.get('/', function (req, res) {
	  if (!db) {
	    initDb(function(err){});
	  }
	  if (db) {
	    var col = db.collection('login');
	    
	    if(req.session.page_views){
	        req.session.page_views++;
	        col.insert({ip: req.ip, views:req.session.page_views, date: Date.now()});
	        res.send("Page accessed - " + req.session.page_views + " times");
	     }else{
	        req.session.page_views = 1;
	        var first ='first';
	        col.insert({firsttime:'first', ip: req.ip, views:req.session.page_views, date: Date.now()});
	        res.send("First time login");
	     }
	    
	    col.insert({ip: req.ip, date: Date.now()});
	  } else {
		     res.send("No DB Connection");
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
