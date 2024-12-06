<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Capture form data
    $salutation = $_POST['salutation'];
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $phone = $_POST['phone'];
    $email = $_POST['email'];
    $houseNumber = $_POST['houseNumber'];
    $address = $_POST['address'];
    $city = $_POST['city'];
    $postalCode = $_POST['postalCode'];
    $course = $_POST['course'];  // Assuming course name is also passed in the form

    // Email to send to
    $to = "manavamishra@gmail.com";
    
    // Subject of the email
    $subject = "New Course Registration: " . $course;
    
    // Email content
    $message = "
    <html>
    <head>
        <title>Course Registration</title>
    </head>
    <body>
        <h2>New Course Registration</h2>
        <p><strong>Course Name:</strong> $course</p>
        <p><strong>Salutation:</strong> $salutation</p>
        <p><strong>First Name:</strong> $firstName</p>
        <p><strong>Last Name:</strong> $lastName</p>
        <p><strong>Phone:</strong> $phone</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>House Number:</strong> $houseNumber</p>
        <p><strong>Street Address:</strong> $address</p>
        <p><strong>City:</strong> $city</p>
        <p><strong>Postal Code:</strong> $postalCode</p>
    </body>
    </html>
    ";
    
    // Headers for the email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8" . "\r\n";
    $headers .= "From: $email" . "\r\n";

    // Send email
    if (mail($to, $subject, $message, $headers)) {
        echo "Form submitted successfully!";
    } else {
        echo "Error in sending email.";
    }
}
?>
