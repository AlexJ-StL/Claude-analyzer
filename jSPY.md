## Project: jSPY

### Project Structure:
- 15 files in 4 directories
- Key directories: api, api\cache, css, js
- Key files: js\app.js

### Key File Contents:

#### api\cache.php
```
<?php
// cache.php
function getCache($key, $ttl = 60) {
    $cachefile = "cache/" . md5($key) . ".json";

    if (file_exists($cachefile) && (time() - filemtime($cachefile)) < $ttl) {
        return json_decode(file_get_contents($cachefile), true);
    }

    return false;
}

function setCache($key, $data) {
    if (!file_exists("cache")) {
        mkdir("cache", 0755, true);
    }

    $cachefile = "cache/" . md5($key) . ".json";
    file_put_contents($cachefile, json_encode($data));
}
?>
```

#### api\db_connect.php
```
<?php
// db_connect.php
// Database connection settings
$host = "localhost"; // Use localhost instead of domain/IP
$user = "u138749295_SPY";
$password = "IbkP@J0#s";
$database = "u138749295_SPY";

// Use persistent connection (p: prefix)
$conn = new mysqli("p:$host", $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $conn->connect_error
    ]));
}

// Return the connection
return $conn;
?>
```

#### api\current-price.php
```
<?php
header('Content-Type: application/json');

// Database connection settings
$host = "localhost";
$user = "u138749295_SPY";
$password = "IbkP@J0#s";
$database = "u138749295_SPY";

// Connect to database
$conn = new mysqli('p:localhost', $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $conn->connect_error
    ]));
}

// Get current price from the current_quote table
$sql = "SELECT price, volume, last_updated FROM current_quote WHERE symbol = 'SPY' ORDER BY last_updated DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $current_price = $row['price'];
    $current_volume = $row['volume'];
    $timestamp = $row['last_updated'];

    // Get previous day's close for change calculation
    $sql_prev = "SELECT close FROM time_series WHERE time_frame = 'daily' ORDER BY date DESC LIMIT 1";
    $result_prev = $conn->query($sql_prev);

    if ($result_prev->num_rows > 0) {
        $row_prev = $result_prev->fetch_assoc();
        $prev_close = $row_prev['close'];
        $change_pct = ($current_price - $prev_close) / $prev_close * 100;
    } else {
        $change_pct = 0;
    }

    echo json_encode([
        'success' => true,
        'price' => $current_price,
        'change' => $change_pct,
        'volume' => $current_volume,
        'timestamp' => $timestamp
    ]);
} else {
```

#### api\range-data.php
```
<?php
header('Content-Type: application/json');

// Database connection settings
$host = "localhost";
$user = "u138749295_SPY";
$password = "IbkP@J0#s";
$database = "u138749295_SPY";

// Connect to database
$conn = new mysqli('p:localhost', $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $conn->connect_error
    ]));
}

// Get day range (high and low from today's data)
$sql_day = "SELECT MIN(low) as day_low, MAX(high) as day_high
            FROM time_series
            WHERE time_frame = 'daily'
            AND date >= CURDATE()";
$result_day = $conn->query($sql_day);

$day_low = null;
$day_high = null;

if ($result_day->num_rows > 0) {
    $row = $result_day->fetch_assoc();
    $day_low = $row['day_low'];
    $day_high = $row['day_high'];
}

// If no data for today, use the most recent day
if ($day_low === null || $day_high === null) {
    $sql_recent = "SELECT low as day_low, high as day_high
                  FROM time_series
                  WHERE time_frame = 'daily'
                  ORDER BY date DESC
                  LIMIT 1";
    $result_recent = $conn->query($sql_recent);
}

    if ($result_recent->num_rows > 0) {
        $row = $result_recent->fetch_assoc();
        $day_low = $row['day_low'];
        $day_high = $row['day_high'];
    }
```

#### api\latest-trade.php
```
<?php
header('Content-Type: application/json');

// Database connection settings
$host = "localhost";
$user = "u138749295_SPY";
$password = "IbkP@J0#s";
$database = "u138749295_SPY";

// Connect to database
$conn = new mysqli('p:localhost', $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $conn->connect_error
    ]));
}

// Get latest timestamp parameter (if provided)
$last_timestamp = isset($_GET['last_timestamp']) ? $_GET['last_timestamp'] : null;

// Query for latest trade data
$sql = "SELECT symbol, timestamp, price, volume FROM real_time_data
        WHERE symbol = 'SPY'";

// If we have a last timestamp, only get newer records
if ($last_timestamp) {
    $sql .= " AND timestamp > '" . $conn->real_escape_string($last_timestamp) . "'";
}

$sql .= " ORDER BY timestamp DESC LIMIT 20";

$result = $conn->query($sql);
$trades = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Get the previous close for change calculation
        if (!isset($prev_close)) {
            $sql_prev = "SELECT close FROM time_series WHERE time_frame = 'daily' ORDER BY date DESC LIMIT 1";
            $result_prev = $conn->query($sql_prev);

            if ($result_prev->num_rows > 0) {
                $row_prev = $result_prev->fetch_assoc();
                $prev_close = $row_prev['close'];
            } else {
                $prev_close = $row['price']; // Fallback if no previous close is available
            }
        }
    }
}
```

### Instructions for Claude:
Based on this project structure and code samples, I'm working on this  project. Please help me with coding tasks, explanation, debugging, and feature suggestions based on this context. You should reference the provided code structure when responding to my questions about this project.

<!-- Token estimate: 1586 (saved ~25358 tokens, 94.1%) -->