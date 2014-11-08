var passwordless = require('passwordless'),
	mongoStore = require('passwordless-mongostore-bcrypt-node'),
	mandrill = require('mandrill-api/mandrill');

// setup for passwordless system
// passwordless.init(new mongoStore(config.mongo.uri));

// app.use(passwordless.sessionSupport());
module.exports = function(app, passportConfig, config) {
	passwordless.init(new mongoStore(config.mongo.uri), {'allowTokenResue':false});
	app.use(passwordless.sessionSupport());

	var mandrillClient = new mandrill.Mandrill(passportConfig.mandrillAPIKey);

	passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback){
		var newMessage = {
			'subject' : "Stanton Space Barn Secure Login",
			'from_email' : "noreply@stantonspacebarn.com",
			'from_name' : "Stanton Space Barn",
			'to' : [{'email' : recipient}],
			'important' : true,
			'auto_text' : false,
			'auto_html' : false,
			'view_content_link' : false,
			'tracking_domain' : 'stantonspacebarn.com',
			'signing' : 'stantonspacebarn.com',
			'global_merge_vars' : [ 
				{'name' : 'token', 'content' : tokenToSend },
				{'name' : 'uid', 'content' : uidToSend}
			]
		};
		mandrillClient.messages.sendTemplate({
			'template_name' : 'ssbtokensend',
			'template_content' : [{'name':'body','content':''}],
			"message" : newMessage
		}, function(result){
			console.log(result);
			if (result[0].status != 'sent') {
				callback('An error occured while sending email\n' + result[0].status);
			}
			callback();
		}, function(error){
			console.log('A mandrill error occurred: ' + error.name + ' - ' + error.message);
			callback('A mandrill error occurred: ' + error.name + ' - ' + error.message);
		});
	});

	app.use(passwordless.acceptToken({ 'successRedirect': '/portal/account'}));

	return passwordless;
}
