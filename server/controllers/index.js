let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let passport = require('passport'); 

// create user model instance
let userModel = require('../models/user');
let User = userModel.User; // alias to make user easy to use


module.exports.displayHomePage = (req, res, next) => {
    res.render('index', {title: 'Home'});
}

module.exports.displayAboutPage = (req, res, next) => {
    res.render('index', { title: 'About'});
}

module.exports.displayProductsPage = (req, res, next) => {
    res.render('index', { title: 'Products'});
}

module.exports.displayServicesPage = (req, res, next) => {
    res.render('index', { title: 'Services'});
}

module.exports.displayContactPage = (req, res, next) => {
    res.render('index', { title: 'Contact'});
}

module.exports.displayLoginPage = (req, res, next) => {
    // check if already logged in
    if(!req.user)
    {
        res.render('auth/login', 
        {
            title: "Login",
            messages: req.flash('loginMessage'),
            displayName: req.user ? req.user.displayName: ''
        })
    }
   else
    {
        return res.redirect('/');
    }
}


module.exports.processLoginPage = (req, res, next) => {
    passport.authenticate('local', 
    (err, user, info) => {
        //server error?
        if (err)
        {
            return next(err);
        }
        // is there user login error?
        if(!user)
        {
            req.flash('loginMessage', 'Authentication error');
            return res.redirect('/login'); 
        }
        req.login(user, (err) => {
            // server error? 
            if(err)
            {
                return next(err)
            }
            return res.redirect('/book-list');
        });
    })(req, res, next); 
}


module.exports.displayRegisterPage = (req, res, next) => {
    if(!req.user) //if not logged in already
    {
        res.render('auth/register', {
            title: 'Register',
            messages: req.flash('registerMessage'),
            displayName: req.user ? req.user.displayName : '' 
        });
    }
    else //user exists
    {
        return res.redirect('/');
    }
}


module.exports.processRegisterPage = (req, res, next) => {
    //instantiate a user object
    let newUser = new User({
        userName: req.body.username,
        email: req.body.email,
        //password: req.body.password not secure
        displayName: req.body.displayName 
    });

    User.register(newUser, req.body.password, (err) => {
        if(err)//server error?
        {
            console.log("ERROR: inserting new user");
            if(err.name =="UserExistsError")
            {
                req.flash(
                    'registerMessage',
                    'Registration Error: User Already Exists!'
                );
                console.log('ERROR: User Already Exists');
            }
            return res.render('auth/register', {
                title: 'Register',
                messages: req.flash('registerMessage'),
                displayName: req.user ? req.user.displayName : '' 
            }); 
        }
        else 
        {
            // if no error exists, register our user successfully
            
            // redirect user and authenticate
            return passport.authenticate('local')(req, res, () => {
                res.redirect('/book-list')
            }); 
        }
    });
}

module.exports.performLogout = (req, res, next) => {
    req.logout(); 
    res.redirect('/');
}