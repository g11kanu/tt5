var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var gcm = require('node-gcm');
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "contacts";
var DEVICES_COLLECTION = "devices";

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
}

var app = express();
app.use(allowCrossDomain);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
//mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {  
mongodb.MongoClient.connect("mongodb://heroku_zsmwj0dq:hj03phhj0lgcur3aqm8bpqlq95@ds029715.mlab.com:29715/heroku_zsmwj0dq", function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/contacts", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.get("/devices", function(req, res) {
  db.collection(DEVICES_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/contacts", function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});


/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);  
    }
  });
});



app.put("/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(204).end();
    }
  });
});

///////////////////////////////////////////////////////////////////////////
//Devices

app.get("/devices/:id", function(req, res) {
    db.collection(DEVICES_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get device");
        } else {
            res.status(200).json(doc);
        }
    });
});


app.post("/devices", function(req, res) {
    var newDevice = req.body;
    //newDevice.Name;
    //newDevice.registrationId = newDevice.registrationId;

    if (!(req.body.registrationId)) {
        handleError(res, "Invalid registration input", "Must provide a valid number." + JSON.stringify(req.body), 400)
    }

    db.collection(DEVICES_COLLECTION).insertOne(newDevice, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new devices.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    });
});


///////////////////////////////////////////////////////////////////////////
//Notification

app.get("/notification/:id", function(req, res) {
    db.collection(DEVICES_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get device");
        } else {

            var device = doc;



            var message = new gcm.Message({
                collapseKey: 'demo',
                priority: 'high',
                contentAvailable: true,
                delayWhileIdle: true,
                timeToLive: 3,
                //restrictedPackageName: "somePackageName",
                dryRun: false,
                data: {
                    key1: 'message1',
                    key2: 'message2'
                },
                notification: {
                    title: "\u270C Escucha:"+req.params.textMessage,
                    icon: "ic_launcher",
                    body: req.params.textMessage
                }
            });

            //message.addData({
            //    key1: 'message1',
            //    key2: 'message2'

            var sender = new gcm.Sender("AIzaSyDbEwejVFjX3HGVt_aTeGOyRdSUspIqvYU");
            var registrationTokens = [];
            registrationTokens.push(device.registrationId);

            sender.send(message,  registrationTokens, 4, function (err, response) {
            //sender.sendNoRetry(message, {registrationTokens: registrationTokens}, function (err, response) {
                if (err)
                {console.log(err);res.status(200).json(err);}
                else  {console.log(response);  res.status(200).json(response);}
            });
            /*

            var sender = new gcm.Sender("AIzaSyDbEwejVFjX3HGVt_aTeGOyRdSUspIqvYU");
            var message = new gcm.Message();
            message.addData('key1','testdarinodegcm');
            message.delay_while_idle = 1;
            var registrationIds = [];
            registrationIds.push(device.registrationId);
            sender.send(message, registrationIds, 4, function (err, result) {
                console.log(err);
                console.log(result);
                if (err) res.status(200).json(err);
                else    res.status(200).json(result);
            })
             */
            /*
            sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
                if (err) res.status(200).json(err);
                else    res.status(200).json(device.registrationId);
            });
 */
            //res.status(200).json(device.registrationId);
             /*
            //sender.send(message, { registrationTokens: registrationTokens }, 10, function (err, response) {
            //   if(err) console.error(err);
            //    else    console.log(response);
*/
            //res.status(200).json(device);
        }
    });
});