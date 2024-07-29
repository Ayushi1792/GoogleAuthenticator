<?php
require 'vendor/autoload.php';

use OTPHP\TOTP;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

$users_db = [];

// Function to generate the secret key
function generate_secret_key() {
    return TOTP::create()->getSecret();
}

// Function to register user credentials
function register_user($username, $password, $email) {
    global $users_db;
    $secret_key = generate_secret_key();
    $users_db[$username] = [
        'password' => $password,
        'secret_key' => $secret_key,
        'email' => $email,
    ];
    return $secret_key;
}
// Function to generate QR Code based on user's register credentials
function generate_qr_code($username, $secret_key) {
    $otp = TOTP::create($secret_key);
    $otp->setLabel($username); 
    $otp->setIssuer('YourCompany'); 
    $uri = $otp->getProvisioningUri();
    
    $qrCode = QrCode::create($uri);
    $writer = new PngWriter();
    $result = $writer->write($qrCode);
    
    $filePath = 'qrcode.png';
    $result->saveToFile($filePath);
    
    echo "QR code generated and saved as {$filePath}\n";
}
// Function to login the user via username, password and entering the google authenticator code
function login() {
    global $users_db;
    $username = readline("Enter your username: ");
    $password = readline("Enter your password: ");

    if (isset($users_db[$username]) && $users_db[$username]['password'] === $password) {
        $secret_key = $users_db[$username]['secret_key'];
        $otp = TOTP::create($secret_key);

        $user_input = readline("Enter Google Authenticator code: ");

        if ($otp->verify($user_input)) {
            echo "Login successful!\n";
        } else {
            echo "Invalid Google Authenticator code.\n";
        }
    } else {
        echo "Invalid username or password.\n";
    }
}

function main() {
    $username = readline("Enter a username: ");
    $password = readline("Enter a password: ");
    $email = readline("Enter your email address: ");
    $secret_key = register_user($username, $password, $email);

    generate_qr_code($username, $secret_key);

    login();
}

main();
?>
