const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test route to check server connectivity
app.get("/test", (req, res) => {
    res.send("Test route is working!");
  });
  
// Database setup (physical db file named "question.db")
const dbPath = path.resolve(__dirname, "question.db"); // ensures full path
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Database connected to question.db.");

    // Create the 'contacts' table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        salutation TEXT,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phone TEXT,
        message TEXT,
        userType TEXT
      )
    `, (err) => {
      if (err) {
        console.error("Error creating contacts table:", err.message);
      } else {
        console.log("Contacts table ready (created if it didn't exist).");
      }
    });
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
      refreshToken: "1//04RgbbZuug39fCgYIARAAGAQSNwF-L9Ir8gXd0oCeWUW9q8kFzcpEJdLPOzEemdkCLybEn4_53NbFwBUVEYCcedsX5nIC4Ahb03c", // Your OAuth2 refresh token
    },
    tls: {
      rejectUnauthorized: false, // Bypass certificate issues for testing
    },
  });

  const mailOptions = {
    from: emailData.from,  // 'from' is set to the user’s email in /send-contact endpoint
    to: emailData.to,      // your receiving email
    subject: emailData.subject,
    html: emailData.html,
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    callback(error, response);
    smtpTransport.close(); // Close the connection after sending the email
  });
}

// Endpoint to handle form submission
app.post("/send-contact", (req, res) => {
  const { salutation, firstName, lastName, email, phone, message, userType } = req.body;

  // Insert data into the contacts table
  const sql = `
    INSERT INTO contacts (salutation, firstName, lastName, email, phone, message, userType)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [salutation, firstName, lastName, email, phone, message, userType], function (err) {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    console.log("Data stored in question.db contacts table:", req.body);

    // Prepare email content
    const emailData = {
      // The user’s email is used as 'from' here
      from: email,                 
      // Where you want to receive the message:
      to: "manavamishra@gmail.com",  
      subject: "Bedankt voor uw bericht",
      html: `
        <h3>Bedankt voor uw bericht!</h3>
        <p>Hier zijn de gegevens die u hebt opgegeven:</p>
        <table border="1" cellpadding="5" cellspacing="0">
            <tr><th>Veld</th><th>Waarde</th></tr>
            <tr><td>Aanhef</td><td>${salutation}</td></tr>
            <tr><td>Voornaam</td><td>${firstName}</td></tr>
            <tr><td>Achternaam</td><td>${lastName}</td></tr>
            <tr><td>E-mail</td><td>${email}</td></tr>
            <tr><td>Telefoon</td><td>${phone}</td></tr>
            <tr><td>Bericht</td><td>${message}</td></tr>
            <tr><td>Type Gebruiker</td><td>${userType}</td></tr>
        </table>
      `,
    };

    // Send the email
    sendEmail(emailData, (error, response) => {
      if (error) {
        console.error("Error sending email:", error.message);
        return res.status(500).json({ error: "Failed to send email." });
      }

      console.log("Email sent successfully:", response);
      res.status(200).json({ message: "Data opgeslagen en e-mail succesvol verzonden." });
    });
  });
});

// Endpoint to retrieve all records from contacts table
app.get("/records", (req, res) => {
  db.all("SELECT * FROM contacts ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error("Error retrieving records:", err.message);
      return res.status(500).json({ error: "Error retrieving records" });
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
