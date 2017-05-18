var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/', function (req, res) {
    res.render('register');
});

router.post('/', function (req, res) {
    // register using api to maintain clean separation between layers
	console.log('Registering user.... ');
    request.post({
        url: '/api/users',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
        	console.log('Error in registering user.... %s', response.body);
            return res.render('register', { error: 'An error occurred' });
        }

        if (response.statusCode !== 200) {
            return res.render('register', {
                error: response.body,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username
            });
        }

        req.session.success = 'Registration successful';
        return res.redirect('/login');
    });
});

module.exports = router; 