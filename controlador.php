<?php
header('Content-Type: text/plain; charset=utf-8');

$archivo = 'usuarios.txt';

// Función para validar y limpiar datos
function limpiarInput($data) {
    return trim(strip_tags($data));
}

// Manejo de CORS (si es necesario)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    
    exit(0);
}

// Obtener estudiantes (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'estudiantes') {
    if (!file_exists($archivo)) {
        echo json_encode([]);
        exit;
    }

    $estudiantes = [];
    $lineas = file($archivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lineas as $linea) {
        list($u, , $t) = explode('|', $linea);
        if ($t === 'student') {
            $estudiantes[] = ['username' => $u];
        }
    }

    echo json_encode($estudiantes);
    exit;
}

// Procesar solicitudes POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recuperación de contraseña
    

    // Registro o Login normal
    $usuario = limpiarInput($_POST['username'] ?? '');
    $clave = limpiarInput($_POST['password'] ?? '');
    $tipo = limpiarInput($_POST['userType'] ?? '');

    if (empty($usuario) || empty($clave)) {
        echo "⚠️ Usuario y contraseña requeridos";
        exit;
    }

    // Registro
    if (isset($_POST['userType'])) {
        if (strlen($clave) < 6) {
            echo "⚠️ La contraseña debe tener al menos 6 caracteres";
            exit;
        }

        if (!in_array($tipo, ['student', 'teacher'])) {
            echo "⚠️ Tipo de usuario inválido";
            exit;
        }

        if (!file_exists($archivo)) {
            file_put_contents($archivo, "");
        }

        $lineas = file($archivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lineas as $linea) {
            list($u, , ) = explode('|', $linea);
            if (strcasecmp($u, $usuario) === 0) {
                echo "⚠️ El usuario ya existe";
                exit;
            }
        }

        file_put_contents($archivo, "$usuario|$clave|$tipo\n", FILE_APPEND);
        echo "OK";
        exit;
    }
    
    // Login
    if (!file_exists($archivo)) {
        echo "⚠️ No hay usuarios registrados";
        exit;
    }

    $lineas = file($archivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lineas as $linea) {
        list($u, $p, $t) = explode('|', $linea);
        if ($u === $usuario && $p === $clave) {
            echo "OK|$t";
            exit;
        }
    }

    echo "❌ Usuario o contraseña incorrectos";
    exit;
}

// Si no coincide con ninguna ruta válida
echo "⚠️ Acción no válida";
?>