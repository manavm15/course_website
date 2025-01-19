const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = 8080;

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Test route to check server connectivity
app.get("/test", (req, res) => {
  res.send("Test route is working!");
});

// Database setup (in-memory database for testing)
const db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Database connected in memory.");
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course TEXT,
            salutation TEXT,
            firstName TEXT,
            lastName TEXT,
            email TEXT,
            birthdate TEXT,
            postalCode TEXT,
            address TEXT,
            houseNumber TEXT,
            city TEXT,
            paymentTerms TEXT,
            iban TEXT
        )
    `);
  }
});

// Function to send email
function sendEmail(emailData, callback) {
  const smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: "manavamishra@gmail.com", // Your Gmail address
      clientId: "931206095614-c3hu4lvvh3srsnkclo2c2kn8o1r2q9nq.apps.googleusercontent.com", // OAuth2 Client ID
      clientSecret: "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", // OAuth2 Client Secret
      refreshToken: "1//04RgbbZuug39fCgYIARAAGAQSNwF-L9Ir8gXd0oCeWUW9q8kFzcpEJdLPOzEemdkCLybEn4_53NbFwBUVEYCcedsX5nIC4Ahb03c", // Use the new OAuth2 refresh token here
    },
    tls: {
      rejectUnauthorized: false, // Bypass certificate issues for testing
    },
  });

  const mailOptions = {
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    generateTextFromHTML: true,
    html: emailData.html,
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    callback(error, response);
    smtpTransport.close(); // Close the connection after sending the email
  });
}

// Endpoint to handle form submission
app.post("/submit-form", (req, res) => {
  console.log("Received data:", req.body); // Log received data

  const {
    course,
    salutation,
    firstName,
    lastName,
    email,
    birthdate,
    postalCode,
    address,
    houseNumber,
    city,
    paymentTerms,
    iban,
  } = req.body;

  // Store data in the database
  const sql = `
        INSERT INTO users (course, salutation, firstName, lastName, email, birthdate, postalCode, address, houseNumber, city, paymentTerms, iban)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.run(
    sql,
    [
      course,
      salutation,
      firstName,
      lastName,
      email,
      birthdate,
      postalCode,
      address,
      houseNumber,
      city,
      paymentTerms,
      iban,
    ],
    function (err) {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).json({ error: "Database error" });
      }

      console.log("Data stored in database:", req.body);

      // Prepare email content
      const emailData = {
        to: email,
        subject: "Registration Confirmation",
        html: `
                <h3>Thank you for your registration!</h3>
                <p>Here are the details you provided:</p>
                <table border="1" cellpadding="5" cellspacing="0">
                    <tr><th>Field</th><th>Value</th></tr>
                    <tr><td>Selected Course</td><td>${course}</td></tr>
                    <tr><td>Salutation</td><td>${salutation}</td></tr>
                    <tr><td>First Name</td><td>${firstName}</td></tr>
                    <tr><td>Last Name</td><td>${lastName}</td></tr>
                    <tr><td>Email</td><td>${email}</td></tr>
                    <tr><td>Birthdate</td><td>${birthdate}</td></tr>
                    <tr><td>Postal Code</td><td>${postalCode}</td></tr>
                    <tr><td>Address</td><td>${address}</td></tr>
                    <tr><td>House Number</td><td>${houseNumber}</td></tr>
                    <tr><td>City</td><td>${city}</td></tr>
                    <tr><td>Payment Terms</td><td>${paymentTerms}</td></tr>
                    <tr><td>IBAN</td><td>${iban}</td></tr>
                </table>
            `,
      };

      sendEmail(emailData, (error, response) => {
        if (error) {
          console.error("Error sending email:", error.message);
          return res.status(500).json({ error: "Failed to send email." });
        }
        console.log("Email sent successfully:", response);
        res.status(200).json({ message: "Data stored and email sent successfully." });
      });
    }
  );
});

// Endpoint to retrieve records
app.get("/records", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error("Error retrieving records:", err.message);
      res.status(500).json({ error: "Error retrieving records" });
    } else {
      res.json(rows);
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
