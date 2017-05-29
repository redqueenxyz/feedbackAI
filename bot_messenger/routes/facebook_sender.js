// Package Dependencies
var sender = require('express').Router(); //TODO: Does this need to be a router? Text with exports. 
var request = require('request')

// Local Dependencies
const facebookAuth = require('@bot_messenger/config/facebook_auth');

// Send Any Message
sender.sendMessage = function(recipientId, messageObject) {
  console.log('\  Sending a message back to Facebook...');

  // Intialize the messageData object that FB will recieve
  var messageData = {
     recipient: {
        id: recipientId
    },
    message:  messageObject
  }
    callSendAPI(messageData);
  };


// Send Text Message 
sender.sendTextMessage = function(recipientId, messageText) {
  console.log('\  Sending a text message back to Facebook...');

  // Intialize the messageData object that FB will recieve
  var messageData = {
     recipient: {
        id: recipientId
    },
    message:  {
      text: messageText
    }
  }
    callSendAPI(messageData);
  };

// Send Templates
sender.sendStructuredMessage = function(recipientId) {
  console.log('\nWe heard \'generic\', get the Structured Message template!');
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };
  callSendAPI(messageData);
}



/** This function demonstrates the Quick Reply capability (!!) which provides the users buttons to respond and returns a defined payload */
// Reference: https://developers.facebook.com/docs/messenger-platform/send-api-reference/quick-replies
sender.sendQuickReply = function(recipientId) {
  console.log('\nWe heard \'quick reply\', get the Quick Reply template!');
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Pick a color:",
      quick_replies: [
        {
          content_type: "text",
          title: "Red",
          payload: "answered_q1", // Recieves this payload back as the new 'message, so maybe just grab this and toss it into FB as part of the 'incoming' loop?
          // TODO: Maybe explore Postbacks for Quick Replies, if necesssary
          image_url: "http://petersfantastichats.com/img/red.png" // Even takes a cute little image for friendliness
          // TODO: Emojis?!
        },
        {
          content_type: "text",
          title: "Green",
          payload: "answered_q1",
          image_url: "http://petersfantastichats.com/img/green.png"
        }
      ]
    }
  };
  callSendAPI(messageData);
}


// Facebook Send API 
/** This function interacts with the Facebook Send Api, so it is called with every message template, and handles actually submitting the final POST request to the Send API / Facebook Messenger */
function callSendAPI(messageData) {
  console.log('\nMessage has been processed, attempting to send a response back to Facebook Send API...');
  request({
    uri: 'https://graph.facebook.com/v2.8/me/messages', // The API endpoint to POST to
    qs: { access_token: facebookAuth.pageAccessToken },
    // TODO: Maybe find a less hacky way to pass the PAGE_TOKEN to the API? Using boolean or here
    method: 'POST',
    json: messageData // actual message to send to the Send API 

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(messageData)

      // If there's NO error or the response is good (200), then print the message
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("\nSuccessfully sent message with id %s to recipient %s: \"%s\" !",
        messageId, recipientId, messageData.message.text);

    } else {
      console.error("Failed to send new message; check your errors!");
      console.log(messageData)
      console.error(response); // Dumps the whole response; very messy console
      console.error(error); // Should still get the error though
    }
  });
}

module.exports = sender;