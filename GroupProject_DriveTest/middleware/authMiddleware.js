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

const checkExaminer = async (req, res, next) => {
    if (!req.session.userId) {
        // If no user is logged in, redirect to the login page
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            // If user not found, redirect to login
            return res.redirect('/login');
        }

        if (user.userType === 'Examiner') {
            // If user is an Examiner, proceed
            next();
        } else {
            // If user is not an Examiner, redirect and show an unauthorized access message
            res.render('dashboard',
                {page: 'dashboard', message: 'Unauthorized to access the page'}
            );
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
};

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

const addIsExaminerToLocals = async (req, res, next) => {
    res.locals.isExaminer = false; // Default to false

    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user && user.userType === 'Examiner') {
                res.locals.isExaminer = true; // Set to true if the user is an Examiner
            }
        } catch (err) {
            res.status(500).send('Server error');
        }
    }

    next();
};

module.exports = { checkLoggedIn, checkDriver, checkAdmin, checkExaminer, addIsLoggedInToLocals, addIsAdminToLocals, addIsExaminerToLocals};
