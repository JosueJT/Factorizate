<?php
header('Content-Type: text/plain; charset=utf-8');

$archivo = 'usuarios.txt';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    
    // Verificar usuario
    if (!isset($_POST['newPassword'])) {
        if (empty($username)) {
            echo "⚠️ Por favor ingresa tu nombre de usuario";
            exit;
        }

        if (!file_exists($archivo)) {
            echo "❌ No hay usuarios registrados";
            exit;
        }

        $lineas = file($archivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $encontrado = false;

        foreach ($lineas as $linea) {
            list($u, $p, $t) = explode('|', $linea);
            if (strcasecmp($u, $username) === 0) {
                echo "✅ Usuario encontrado. Ingresa tu nueva contraseña.";
                $encontrado = true;
                break;
            }
        }

        if (!$encontrado) {
            echo "❌ Usuario no encontrado";
        }
        exit;
    }
    
    // Actualizar contraseña
    $newPassword = trim($_POST['newPassword'] ?? '');
    
    if (empty($username) || empty($newPassword)) {
        echo "⚠️ Datos incompletos";
        exit;
    }
    
    if (strlen($newPassword) < 6) {
        echo "⚠️ La contraseña debe tener al menos 6 caracteres";
        exit;
    }
    
    if (!file_exists($archivo)) {
        echo "❌ No hay usuarios registrados";
        exit;
    }
    
    $lineas = file($archivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $actualizado = false;
    $nuevasLineas = [];
    
    foreach ($lineas as $linea) {
        list($u, $p, $t) = explode('|', $linea);
        if (strcasecmp($u, $username) === 0) {
            $nuevasLineas[] = "$u|$newPassword|$t";
            $actualizado = true;
        } else {
            $nuevasLineas[] = $linea;
        }
    }
    
    if ($actualizado) {
        file_put_contents($archivo, implode("\n", $nuevasLineas) . "\n");
        echo "🔒 Contraseña actualizada correctamente";
    } else {
        echo "❌ Error al actualizar la contraseña";
    }
    exit;
}

echo "⚠️ Solicitud no válida";
?>