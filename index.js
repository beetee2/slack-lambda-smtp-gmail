var config = require('./config.json');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// example event payload from slack slash command
// token=asdfghjklzxcvbnm
// team_id=T0001
// team_domain=example
// channel_id=C2147483705
// channel_name=test
// user_id=U2147483697
// user_name=Steve
// command=/weather
// text=94070

// Entrypoint for AWS Lambda
exports.handler = function(event, context) {
  var message = event.text ? event.text.trim() : null;

  console.log('[EVENT] ', event);

  // verify request came from slack - could also check that event.command === /weather
  if(event.token !== config.slashCommandToken) {
    return context.fail('Unauthorized request. Check config.slashCommandToken.');
  }

  var transporter = nodemailer.createTransport(smtpTransport({
    //service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: config.senderAddress, // Your email id
        pass: config.gmailPassword // Your password
    }
}));

  var mailOptions = {
      from: config.senderAddress,
      to: config.receiverAddresses,
      subject: 'Production Rollback',
      text: message // plaintext body
      // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
  };

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log('[FAIL] Unable to send email: ', error);
          context.fail('Unable to send email: ' + error);
      }else{
          context.succeed(info.response);
      }
  });
};