const User = require('../models/user');
function checkLoggedIn(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

async function checkDriver(req, res, next) {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (!user) {
                res.redirect('/login');
            } else if (user.userType === 'Driver') {
                next();
            } else {
                res.render('dashboard',
                    {page: 'dashboard', message: 'Unauthorized to access the page'}
                );
            }
        } catch (err) {
            res.status(500).send('Server error');
        }
    } else {
        res.redirect('/login');
    }
}

async function checkAdmin(req, res, next) {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (!user) {
                res.redirect('/login');
            } else if (user.userType === 'Admin') {
                next();
            } else {
                res.render('dashboard',
                    {page: 'dashboard', message: 'Unauthorized to access the page'}
                );
            }
        } catch (err) {
            res.status(500).send('Server error');
        }
    } else {
        res.redirect('/login');
    }
}

function addIsLoggedInToLocals(req, res, next) {
    res.locals.isLoggedIn = req.session.userId != null;
    next();
}

async function addIsAdminToLocals(req, res, next) {
    res.locals.isAdmin = false;

    if (res.locals.isLoggedIn) {
        try {
            const user = await User.findById(req.session.userId);
            if (user && user.userType === 'Admin') {
                res.locals.isAdmin = true;
            }
        } catch (err) {
            return res.status(500).send('Server error');
        }
    }

    next();
}

module.exports = { checkLoggedIn, checkDriver, checkAdmin, addIsLoggedInToLocals, addIsAdminToLocals};
