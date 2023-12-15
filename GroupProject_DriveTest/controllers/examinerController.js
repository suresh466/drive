const User = require('../models/user');

const examinerDashboard = async (req, res) => {
    try {
        const testTypeFilter = req.query.testType || 'All';
        let filter = {};

        if (testTypeFilter !== 'All') {
            filter.testType = testTypeFilter;
        }

        // Fetch users with appointments and optionally filter by test type
        const usersWithAppointments = await User.find({ 
            appointment: { $ne: null }, 
            result: null,
            ...filter 
        }).populate('appointment');

        // Prepare data for rendering
        const appointmentData = usersWithAppointments.map(user => ({
            driverName: `${user.firstname} ${user.lastname}`,
            testType: user.testType,
            date: user.appointment.date,
            time: user.appointment.time,
            carMake: user.car_details.make,
            carModel: user.car_details.model,
            username: user.username,
        }));

        res.render('examiner', { appointments: appointmentData, testTypeFilter });
    } catch (error) {
        console.error('Error in examinerDashboard:', error);
        res.status(500).send('Server Error');
    }
};

const driverDetails = async (req, res) => {
    try {
        const username = req.query.username;
        const user = await User.findOne({ username: username});
        res.render('examinerDriver', {user});
    } catch (error) {
        console.error('Error in driverDetails:', error);
        res.status(500).send('Server Error');
    }
}

const updateDriverDetails = async (req, res) => {
    try {
        let result = req.body.result; // Will be either "Pass" or "Fail"
        if (result === 'Pass') {
            result = true;
        } else {
            result = false;
        }
        const username = req.body.username;
        const comments = req.body.comments;

        // Find the user by username and update the result and comments
        const user = await User.findOneAndUpdate(
            { username: username },
            { result: result, comment: comments },
            { new: true }
        );

        // Redirect to the driver details page or another page as needed
        res.redirect(`/examiner/`);
    } catch (error) {
        console.error('Error in updateDriverDetails:', error);
        res.status(500).send('Server Error');
    }
};

module.exports = { examinerDashboard, driverDetails, updateDriverDetails };
