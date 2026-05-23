<?php
// AI Racer shared training-progress slot (single slot, last write wins by design).
// GET  -> the stored training export code (text/plain), 404 when nothing is stored yet.
// POST -> store the request body as the new code. The body must look like a Base64
//         training code (charset check) and stay under the size cap; everything else
//         is rejected so the file can never hold markup or arbitrary binary junk.
$file = __DIR__ . '/ai-racer-progress.txt';
$maxBytes = 300000;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method === 'GET') {
    header('Content-Type: text/plain; charset=utf-8');
    if (is_file($file)) {
        readfile($file);
    } else {
        http_response_code(404);
    }
    exit;
}

if ($method === 'POST') {
    $body = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    header('Content-Type: text/plain; charset=utf-8');
    if ($body === false || strlen(trim($body)) === 0) {
        http_response_code(400);
        exit('empty body');
    }
    if (strlen($body) > $maxBytes) {
        http_response_code(413);
        exit('too large');
    }
    $body = trim($body);
    if (!preg_match('/^[A-Za-z0-9+\/=]+$/', $body)) {
        http_response_code(400);
        exit('not a training code');
    }
    if (file_put_contents($file, $body, LOCK_EX) === false) {
        http_response_code(500);
        exit('write failed');
    }
    exit('ok');
}

http_response_code(405);
