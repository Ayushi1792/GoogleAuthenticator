<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'vendor/autoload.php';

use Slim\Factory\AppFactory;
use OTPHP\TOTP;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app = AppFactory::create();
$app->addErrorMiddleware(true, true, true);
$app->addBodyParsingMiddleware();

// CORS middleware
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// MySQL database connection
function get_db_connection() {
    $host = '127.0.0.1';  // or your server's IP address
    $port = 3307;  // standard MySQL port, change if yours is different
    $db   = 'GAuthenticator';
    $user = 'root';
    $pass = '1234';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
}

// Function to generate the secret key
function generate_secret_key() {
    $secret = random_bytes(16);
    return base32_encode($secret);
}

function base32_encode($input) {
    $map = array(
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', //  7
        'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', // 15
        'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', // 23
        'Y', 'Z', '2', '3', '4', '5', '6', '7', // 31
    );

    if (empty($input)) return "";

    $input = str_split($input);
    $binaryString = "";
    for ($i = 0; $i < count($input); $i++) {
        $binaryString .= str_pad(decbin(ord($input[$i])), 8, '0', STR_PAD_LEFT);
    }
    $fiveBitBinaryArray = str_split($binaryString, 5);
    $base32 = "";
    $i = 0;
    while ($i < count($fiveBitBinaryArray)) {
        $base32 .= $map[base_convert(str_pad($fiveBitBinaryArray[$i], 5, '0'), 2, 10)];
        $i++;
    }
    return $base32;
}

// Function to register user credentials
function register_user($username, $password, $email) {
    $db = get_db_connection();
    $secret_key = generate_secret_key();
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $db->prepare("INSERT INTO users (username, password, secret_key, email) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $hashed_password, $secret_key, $email]);
    
    return $secret_key;
}

// Function to generate QR Code based on user's registered credentials
function generate_qr_code($username, $secret_key) {
    $otp = TOTP::create($secret_key);
    $otp->setLabel($username);
    $otp->setIssuer('YourCompany');
    $uri = $otp->getProvisioningUri();

    $qrCode = QrCode::create($uri);
    $writer = new PngWriter();
    $result = $writer->write($qrCode);

    return $result->getDataUri();
}

// Route to register a user
$app->post('/register', function (Request $request, Response $response, $args) {
    try {
        $data = $request->getParsedBody();
        
        // Validate input
        if (!isset($data['username']) || !isset($data['password']) || !isset($data['email'])) {
            throw new Exception("Missing required fields");
        }
        
        $username = trim($data['username']);
        $password = $data['password'];
        $email = $data['email'];

        $db = get_db_connection();
        $stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            throw new Exception("Username already exists");
        }

        $secret_key = register_user($username, $password, $email);
        $qr_code_data_uri = generate_qr_code($username, $secret_key);

        $response_data = [
            'message' => 'Registration successful',
            'secret_key' => $secret_key,
            'qr_code_data_uri' => $qr_code_data_uri
        ];

        error_log("User registered successfully: $username");
        $response->getBody()->write(json_encode($response_data));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $errorMessage = $e->getMessage();
        $errorCode = $e->getCode();
        error_log("Registration error: " . $errorMessage . " (Code: " . $errorCode . ")");
        $response->getBody()->write(json_encode(['error' => $errorMessage, 'code' => $errorCode]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Route to login the user
$app->post('/login', function (Request $request, Response $response, $args) {
    try {
        $data = $request->getParsedBody();

        // Validate input
        if (!isset($data['username']) || !isset($data['password']) || !isset($data['otp_code'])) {
            throw new Exception("Missing required fields");
        }

        $username = trim($data['username']);
        $password = $data['password'];
        $otp_code = $data['otp_code'];

        error_log("Login attempt for username: $username");
        
        $db = get_db_connection();
        $stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new Exception("User not found");
        }

        // Verify password
        if (!password_verify($password, $user['password'])) {
            throw new Exception("Invalid password");
        }

        // Verify OTP
        $secret_key = $user['secret_key'];
        $otp = TOTP::create($secret_key);

        if (!$otp->verify($otp_code)) {
            throw new Exception("Invalid Google Authenticator code");
        }

        // Success response
        error_log("Login successful for user: $username");
        $response->getBody()->write(json_encode(['message' => $username]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $errorMessage = $e->getMessage();
        error_log("Login error: " . $errorMessage);
        $response->getBody()->write(json_encode(['error' => $errorMessage]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
});

// Route to list all users (for debugging)
$app->get('/users', function (Request $request, Response $response) {
    $db = get_db_connection();
    $stmt = $db->query("SELECT username FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $response->getBody()->write(json_encode($users));
    return $response->withHeader('Content-Type', 'application/json');
});

// Root route
$app->get('/', function (Request $request, Response $response) {
    $response->getBody()->write("Welcome to the API");
    return $response;
});

$app->run();