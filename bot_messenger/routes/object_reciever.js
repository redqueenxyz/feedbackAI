// Recieves objects from Facebook

// Package Dependencies
let reciever = require('express').Router();
let bodyParser = require('body-parser');
let logger = require('winston');

// Local Dependencies
message_handler = require('../services/message_handler');
postback_handler = require('../services/postback_handler');
payload_handler = require('../services/payload_handler');

// Parsing
reciever.use(bodyParser.json());
reciever.use(bodyParser.urlencoded({extended: true}));

// Recieving Messages 
reciever.post('/', function(req, res) {
  // Encapsulate
  let data = req.body;

  // Log
  logger.info('...Object recieved: ', {data});

  if (data.object === 'page') {
    // Log
    logger.verbose('...Identifying object...');

    // Iterate over each event in the object
    data.entry.forEach(function(entry) {
      entry.messaging.forEach(function(event) {
        // Event parameters
        let userID = event.sender.id;
        let recipientID = event.recipient.id;
        let message = event.message;

        // Message parameters
        let messageId = message.mid;
        let messageText = message.text;

        // Potentially Undefined
        let messagePostback = (message.postback || false);
        let messagePayload = (message.quick_reply ? message.quick_reply.payload : false); // if a is true ? assign var is b, else var is false

        if (messagePostback) {
          logger.warn('...Postback Recieved: ', {event});
          postback_handler.receivedPostback(event);
        } if (messagePayload) {
          logger.warn('...Payload Recieved: ', {event});
          payload_handler.recievedPayload(event);
        } else if (event.message && !message.postback && !message.payload) {
          // If it has a message component, run recievedMessage()
          logger.warn('...Message Recieved: ', {event});
          message_handler.receivedMessage(event);
        } else {
          logger.info('...Unknown Object Recieved:', {event});
        }
      });
    });
    // Send 200 after processing; must send back a 200 within 20 seconds, otherwise times out and FB keeps retrying
    res.sendStatus(200);
  }
});

module.exports = reciever;
