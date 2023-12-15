const User = require('../models/user');
const Appointment = require('../models/appointment');

const g2 = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const isNewUser = user.licenseNo === 'default' ? true : false;

        const isBooked = user.appointment !== null ? true : false;
        let bookedAppointment = false;

        if (isBooked) bookedAppointment = await Appointment.findById(user.appointment);

        res.render('g2', {
            page: 'g2_test',
            user: user,
            errors: {},
            isNewUser,
            availableSlots: [],
            bookedAppointment
        });

    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
}

const submitG2 = async (req, res) => {
    try {
        const userId = req.session.userId;
        const updatedData = {
            firstname: req.body.firstName,
            lastname: req.body.lastName,
            age: req.body.age,
            licenseNo: req.body.licenseNumber,
            car_details: {
                make: req.body.make,
                model: req.body.model,
                year: req.body.year,
                platno: req.body.plateNumber
            }
        };

        await User.findByIdAndUpdate(userId, updatedData, { new: true });

        res.redirect('/g');
    } catch (err) {
        res.status(500).send('Error updating user: ' + err.message);
    }
}

const g = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user.licenseNo === 'default') {
            // Redirect to G2 page if license number is default
            res.redirect('/g2');
        } else {
            const isBooked = user.appointment !== null ? true : false;
            let bookedAppointment = false;

            if (isBooked) bookedAppointment = await Appointment.findById(user.appointment);
            // Show G page with pre-filled data
            res.render('g', { page: 'g_test', user: user, bookedAppointment, availableSlots: [] });
        }
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
}

const updateG = async (req, res) => {
    try {
        const userId = req.session.userId;  // Use session user ID
        await User.updateOne({ _id: userId }, {
            "car_details.make": req.body.make,
            "car_details.model": req.body.model,
            "car_details.year": req.body.year,
            "car_details.platno": req.body.plateNumber
        });

        res.redirect('/g');  // Redirect to G page after update
    } catch (err) {
        res.status(500).send('Error updating car details: ' + err.message);
    }
}

const book = async (req, res) => {
    try {
        const { date, time, testType } = req.body;

        const appointment = await Appointment.findOne({ date, time });

        console.log('before')
        await Appointment.updateOne({ _id: appointment._id }, { isTimeSlotAvailable: false });
        // Update the currently logged-in user's appointment reference
        const userId = req.session.userId;
        await User.findByIdAndUpdate(userId, { testType: testType, appointment: appointment._id });

        res.redirect(`/${testType}`);

    } catch (error) {
        res.status(500).send('Server Error: ' + error.message);
    }
};

module.exports = { g2, submitG2, g, updateG, book }
