const Appointment = require("../models/appointment");
const User = require("../models/user");

const appointment = (req, res) => {
	res.render("appointment", { page: "appointment" });
};

const add = async (req, res) => {
	const { date, time } = req.body;

	try {
		const newAppointment = new Appointment({
			date,
			time,
			isTimeSlotAvailable: true,
		});
		await newAppointment.save();
		res.redirect("/admin/appointment");
	} catch (error) {
		if (error.name === "ValidationError") {
			return res
				.status(400)
				.send(
					"Error: Appointment slot for the specified date and time already exists.",
				);
		}
		res.status(500).send("Server Error: " + error.message);
	}
};

const fetch = async (req, res) => {
	try {
		const { date } = req.query;
		if (!date) {
			return res.status(400).send("Date is required");
		}

		const availableSlots = await Appointment.find({
			date: date,
			isTimeSlotAvailable: true,
		});

		res.json(availableSlots);
	} catch (err) {
		res.status(500).send("Error: " + err.message);
	}
};

const listCandidates = async (req, res) => {
	try {
		const resultFilter = req.query.result || "All";
		let filter = {};

		if (resultFilter !== "All") {
			filter.result = resultFilter === "Pass" ? true : false;
		}

		const candidates = await User.find({
			result: { $in: [true, false] },
			...filter,
		}).populate("appointment");
		res.render("adminResult", { candidates, resultFilter });
	} catch (error) {
		res.status(500).send("Server Error");
	}
};

module.exports = { appointment, add, fetch, listCandidates };
