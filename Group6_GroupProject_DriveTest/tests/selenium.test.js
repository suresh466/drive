const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// Type in npm install first then npm test to run the test using jest

// Using jests to run the tests
describe("Selenium Tests", () => {
	let driver;

	// Build the driver before all tests
	beforeAll(async () => {
		const options = new chrome.Options();
		driver = await new Builder()
			.forBrowser("chrome")
			.setChromeOptions(options)
			.build();
	}, 10000);

	afterAll(async () => {
		await driver.quit();
	});

	test("Registration test", async () => {
		// Navigate to the login page
		await driver.get("http://localhost:3000/login");

		// Fill in the fields and submit the form
		await driver.findElement(By.id("username")).sendKeys("admin7");
		await driver.findElement(By.id("password")).sendKeys("admin7");
		await driver
			.findElement(By.id("repeat_password"))
			.sendKeys("admin7", Key.RETURN);

		// Wait for the page to redirect after form submission
		await driver.wait(until.urlIs("http://localhost:3000/signup"), 5000);

		let alertMessageElement;
		try {
			// Wait for the alert message element to be present
			alertMessageElement = await driver.wait(
				until.elementLocated(By.id("message")),
				5000,
			);
		} catch (error) {
			// If the element is not found, the test fails
			expect(error.message).toContain("no such element");
		}

		const alertMessage = await alertMessageElement.getText();

		// If the message is "Account created successfully!", the test passes
		if (alertMessage === "Account created successfully!") {
			expect(true).toBe(true);
		} else {
			// If the message is anything else, fail the test
			throw new Error(`Unexpected alert message: ${alertMessage}`);
		}
	}, 10000);

	test("Login test", async () => {
		await driver.get("http://localhost:3000/login");

		// wait for the login form to load
		await driver.wait(until.elementLocated(By.id("loginUsername")), 5000);

		await driver.findElement(By.id("loginUsername")).sendKeys("admin");
		await driver
			.findElement(By.id("loginPassword"))
			.sendKeys("admin", Key.RETURN);

		try {
			// Wait for the page to redirect after form submission
			await driver.wait(until.urlIs("http://localhost:3000/dashboard"), 5000);

			// If redirected to the dashboard, the test passes
			expect(true).toBe(true);
		} catch (error) {
			// If the page URL is still the login page, the test fails
			const currentUrl = await driver.getCurrentUrl();
			if (currentUrl === "http://localhost:3000/login") {
				// Wait for the alert message element to be present
				const alertMessageElement = await driver.wait(
					until.elementLocated(By.id("message")),
					5000,
				);

				const alertMessage = await alertMessageElement.getText();
				throw new Error(`Unexpected alert message: ${alertMessage}`);
			}
		}
	}, 10000);

	test("Add appointment slot test", async () => {
		// The admin is already logged in from the previous test
		await driver.get("http://localhost:3000/admin/appointment");

		// Select today's date
		const today = new Date();
		const todayString = today.toISOString().split("T")[0];
		await driver.findElement(By.id("appointmentDate")).sendKeys(todayString);

		// Select time
		await driver.findElement(By.id("appointmentTime")).sendKeys("12:00");

		// Submit the form
		await driver.findElement(By.css("form")).submit();

		try {
			// Wait for the page to redirect after form submission
			await driver.wait(
				until.urlIs("http://localhost:3000/admin/appointment"),
				5000,
			);

			// If redirected back to the appointment page, the test passes
			expect(true).toBe(true);
		} catch (error) {
			// If redirected to the add appointment page with an error message, the test fails
			const currentUrl = await driver.getCurrentUrl();
			if (currentUrl === "http://localhost:3000/admin/appointment/add") {
				const bodyText = await driver.findElement(By.tagName("body")).getText();
				if (
					bodyText.includes(
						"Error: Appointment slot for the specified date and time already exists.",
					)
				) {
					throw new Error(`Unexpected error message: ${bodyText}`);
				}
			} else {
				throw new Error(`Unexpected page URL: ${currentUrl}`);
			}
		}
	}, 10000);
});
