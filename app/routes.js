module.exports = function(app, express, passwordless) {
	var router = express.Router(),
		bcrypt   = require('bcrypt-nodejs'),
		flash = require('connect-flash'),
		User = require('./models/user');

	router.get('/grid', function(req, res) {
		res.render('docs/grid.jade');
	})

	// User management
	router.get('/account/login', function(req, res){
		res.render('account/loginView.jade');
	});
	router.post('/account/login', passwordless.requestToken(function(user, delivery, callback){
		// find the user based on email address in 'user' and return the userID
		console.log('requestToken');
		User.find({'local.email' : user}, function(err, results){
			if (err) {
				callback('error', null);
			}
			else {
				if (results.length == 1) {
					console.log("Found user - calling back");
					callback(null, results[0].local.uid);
				}
				else if (results.length == 0) {
					// create new user
					var newUser = new User({
						'local' : {
							'email' : user
						}
					});
					var uid = require('crypto').createHash('md5').update(user).digest('hex');
					// safety check to ensure this generated UID doesn't collide
					User.find({'local.uid' : uid}, function(err, uidResults){
						if (err) callback('error', null);
						if (uidResults.length != 0) callback('error', null);
						newUser.local.uid = uid;
						newUser.save(function(err, savedUser){
							if (err) callback('error', null);
							callback(null, uid);
						});
					});
				}
				else {
					callback('error', null);
				}
			}
		});
	}, {'failureRedirect' : '/account/login', 'failureFlash' : "Oh my! This isn't the jump you were looking for.  We have experienced a comms error. Try again later, and if this persists please contact agathorn@stantonspacebarn.com",
		'successFlash' : "You should have an email in a couple seconds with a secure login link"}), 
	function(req, res){
		console.log("Rendering login view after login post");
		res.render('account/loginView.jade', {'flash' : req.flash('passwordless-success')});
	});
	router.use('/account', passwordless.restricted({
		'failureRedirect' : '/account/login'
	}));
	router.get('/account', function(req, res){
		User.find({'local.uid' : req.user}, function(err, results){
				if (err) {
					req.flash('error', 'A database error occured and we could not locate your account');
					res.redirect('/account/login');
				}
				else {
					var userAccount = results[0];
					var localVariables = {
						'apiKeys' : userAccount.local.apiKeys
					};
					res.render('account/accountView.jade', localVariables);
				}
			});
	});

	app.use('/', router);
};

