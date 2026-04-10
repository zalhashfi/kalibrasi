# 📡 Kalibrasi — Sensor Data Monitoring Platform

Platform monitoring data sensor IoT berbasis web. Data sensor dapat dilihat secara publik tanpa login, sementara pengelolaan device dan export data hanya dapat dilakukan oleh admin.

## 🏗️ Arsitektur

```
┌─────────────────┐     HTTP POST      ┌──────────────────┐     MySQL      ┌─────────────┐
│   IoT Device    │ ──────────────────> │   Backend API    │ ────────────> │   Database   │
│ (ESP32/Arduino) │    (API Key)        │  (Express.js)    │               │   (Prisma)   │
└─────────────────┘                     └──────────────────┘               └─────────────┘
                                               │
                                          REST API
                                               │
                                        ┌──────────────────┐
                                        │    Frontend       │
                                        │   (React + Vite)  │
                                        └──────────────────┘
```

## ✨ Fitur

### 🌐 Public (Tanpa Login)
- Monitoring data sensor secara real-time
- Pilih device tertentu untuk melihat datanya
- Auto-refresh setiap 10 detik
- Tampilan responsif (desktop, tablet, mobile)

### 🛡 Admin (Login Required)
- Manajemen device (tambah, edit, hapus, regenerate API key)
- Export data sensor ke CSV per device
- Login admin dengan validasi JWT

## 🛠️ Tech Stack

| Layer     | Teknologi                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 19, Vite 7, Tailwind CSS 4, React Router |
| Backend   | Node.js, Express.js 4                           |
| Database  | MySQL (via Prisma ORM)                          |
| Auth      | JWT (JSON Web Token), bcrypt                    |
| Device    | API Key Authentication                          |

## 📁 Struktur Folder

```
KALIBRASI/
├── backend/
│   ├── controllers/
│   │   ├── DeviceController.js      # CRUD device + public device list
│   │   ├── LoginController.js       # Login & JWT token
│   │   ├── RegisterController.js    # Register user (via API only)
│   │   ├── SensorDataController.js  # Store & retrieve sensor data
│   │   └── UserController.js        # User management (admin)
│   ├── middlewares/
│   │   ├── auth.js                  # JWT token verification
│   │   ├── verifyAdmin.js           # Admin role check
│   │   └── verifyApiKey.js          # Device API key verification
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── client.js                # Prisma client instance
│   ├── routes/
│   │   └── index.js                 # All API routes
│   ├── utils/
│   │   ├── apiKeyGenerator.js       # Generate unique API keys
│   │   ├── timezone.js              # WIB timezone helper
│   │   └── validators/              # Request validation rules
│   ├── index.js                     # Express server entry point
│   ├── package.json
│   └── .env                         # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx            # Public sensor monitoring
│   │   │   ├── AdminLoginPage.jsx      # Admin login
│   │   │   └── AdminDashboardPage.jsx  # Admin panel
│   │   ├── panels/
│   │   │   ├── DeviceManagementPanel.jsx  # Device CRUD
│   │   │   ├── ExportCSVPanel.jsx         # Export data to CSV
│   │   │   └── SensorDataPanel.jsx        # Sensor data display
│   │   ├── components/
│   │   │   └── Modal.jsx               # Reusable modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Auth state management
│   │   ├── services/
│   │   │   └── api.js                  # API client functions
│   │   ├── App.jsx                     # Routes & auth provider
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js >= 18
- MySQL Server
- npm atau yarn

### 1. Clone Repository

```bash
git clone https://github.com/your-username/kalibrasi.git
cd kalibrasi
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
```

Edit file `.env`:

```env
# Database
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"

# JWT Secret (ganti dengan string random)
JWT_SECRET="your-secret-key-here-change-this"

# Port (opsional, default: 3001)
PORT=3001
```

```bash
# Generate Prisma Client & Migrate Database
npx prisma migrate dev --name init

# Jalankan server
npm run dev
```

Backend berjalan di `http://localhost:3001`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# (Opsional) Buat .env jika backend bukan di localhost:3001
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

```bash
# Jalankan development server
npm run dev
```

Frontend berjalan di `http://localhost:5173`

### 4. Buat Akun Admin Pertama

Gunakan Postman atau curl untuk membuat akun admin:

```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Kemudian set user sebagai admin di database:

```sql
UPDATE users SET isAdmin = true WHERE email = 'admin@example.com';
```

## 📡 API Reference

### Auth Routes

| Method | Endpoint          | Auth     | Description           |
|--------|-------------------|----------|-----------------------|
| POST   | `/api/login`      | -        | Login user            |
| POST   | `/api/register`   | -        | Register user baru    |

### Public Routes

| Method | Endpoint                            | Auth | Description                |
|--------|-------------------------------------|------|----------------------------|
| GET    | `/api/devices`                      | -    | Daftar device aktif        |
| GET    | `/api/sensor-data`                  | -    | Semua data sensor          |
| GET    | `/api/sensor-data/:id`              | -    | Data sensor by ID          |
| GET    | `/api/sensor-data/device/:deviceId` | -    | Data sensor by device      |

**Query Parameters untuk sensor data:**
- `deviceId` — Filter berdasarkan device
- `limit` — Jumlah data (default: 100)
- `offset` — Offset pagination (default: 0)
- `startDate` — Filter tanggal mulai (ISO format)
- `endDate` — Filter tanggal akhir (ISO format)

### Admin Routes (JWT Required)

| Method | Endpoint                                   | Auth       | Description               |
|--------|--------------------------------------------|------------|---------------------------|
| GET    | `/api/admin/devices`                       | JWT+Admin  | List semua device         |
| POST   | `/api/admin/devices`                       | JWT+Admin  | Tambah device baru        |
| GET    | `/api/admin/devices/:id`                   | JWT+Admin  | Detail device             |
| PUT    | `/api/admin/devices/:id`                   | JWT+Admin  | Update device             |
| DELETE | `/api/admin/devices/:id`                   | JWT+Admin  | Deactivate device         |
| PUT    | `/api/admin/devices/:id/reactivate`        | JWT+Admin  | Reactivate device         |
| POST   | `/api/admin/devices/:id/regenerate-key`    | JWT+Admin  | Generate API key baru     |
| GET    | `/api/admin/users`                         | JWT+Admin  | List semua user           |
| POST   | `/api/admin/users`                         | JWT+Admin  | Tambah user baru          |
| GET    | `/api/admin/users/:id`                     | JWT+Admin  | Detail user               |
| PUT    | `/api/admin/users/:id`                     | JWT+Admin  | Update user               |
| DELETE | `/api/admin/users/:id`                     | JWT+Admin  | Deactivate user           |
| DELETE | `/api/admin/sensor-data/:id`               | JWT+Admin  | Hapus data sensor         |

### Sensor Data Ingestion (Device API Key)

| Method | Endpoint             | Auth       | Description              |
|--------|----------------------|------------|--------------------------|
| POST   | `/api/sensor-data`   | API Key    | Kirim data dari device   |

**Headers:**
```
x-api-key: YOUR_DEVICE_API_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "payload": {
    "temperature": 28.5,
    "humidity": 65.2,
    "pressure": 1013.25
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Sensor data stored successfully",
  "data": {
    "id": 1,
    "deviceId": 1,
    "deviceName": "Sensor Lab Kimia",
    "payload": {
      "temperature": 28.5,
      "humidity": 65.2,
      "pressure": 1013.25
    },
    "createdAt": "2026-04-09T12:00:00.000Z"
  }
}
```

## 🔌 Kode IoT Device (Arduino/ESP32)

Berikut contoh kode untuk mengirim data sensor ke API menggunakan ESP32.

### Wiring / Koneksi Sensor

Sesuaikan wiring dengan sensor yang digunakan. Contoh ini menggunakan sensor DHT22 untuk suhu & kelembapan.

### Kode ESP32 (Arduino IDE)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ============================================
// KONFIGURASI - Sesuaikan dengan kebutuhan
// ============================================

// WiFi credentials
const char* WIFI_SSID     = "NAMA_WIFI_ANDA";
const char* WIFI_PASSWORD = "PASSWORD_WIFI_ANDA";

// API Configuration
const char* API_URL = "http://IP_SERVER_ANDA:3001/api/sensor-data";
const char* API_KEY = "API_KEY_DEVICE_ANDA";  // Dapatkan dari Admin Dashboard

// Interval pengiriman data (dalam milidetik)
const unsigned long SEND_INTERVAL = 30000;  // 30 detik

// ============================================
// CONTOH: Sensor DHT22 (Suhu & Kelembapan)
// ============================================
// Uncomment jika menggunakan DHT22:
// #include <DHT.h>
// #define DHTPIN 4
// #define DHTTYPE DHT22
// DHT dht(DHTPIN, DHTTYPE);

// ============================================
// VARIABEL GLOBAL
// ============================================
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("========================================");
  Serial.println("  Kalibrasi - IoT Sensor Device");
  Serial.println("========================================");

  // Inisialisasi sensor
  // dht.begin();  // Uncomment jika pakai DHT22

  // Koneksi WiFi
  connectWiFi();
}

void loop() {
  // Pastikan WiFi tetap terhubung
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // Kirim data setiap interval
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendSensorData();
    lastSendTime = millis();
  }

  delay(100);
}

// ============================================
// FUNGSI: Koneksi WiFi
// ============================================
void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Connected! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi connection failed! Retrying in 5 seconds...");
    delay(5000);
  }
}

// ============================================
// FUNGSI: Baca Sensor & Kirim Data
// ============================================
void sendSensorData() {
  // -----------------------------------------------
  // BACA SENSOR - Sesuaikan dengan sensor Anda
  // -----------------------------------------------

  // Contoh 1: DHT22 (suhu & kelembapan)
  // float temperature = dht.readTemperature();
  // float humidity = dht.readHumidity();
  // if (isnan(temperature) || isnan(humidity)) {
  //   Serial.println("Failed to read DHT22!");
  //   return;
  // }

  // Contoh 2: Data dummy untuk testing
  float temperature = 25.0 + random(0, 100) / 10.0;
  float humidity = 50.0 + random(0, 300) / 10.0;

  // Contoh 3: Analog sensor (misalnya LDR, soil moisture)
  // int analogValue = analogRead(34);
  // float voltage = analogValue * (3.3 / 4095.0);

  // -----------------------------------------------
  // BUAT JSON PAYLOAD
  // -----------------------------------------------
  // Payload bisa berisi field apapun sesuai kebutuhan.
  // Semua data akan disimpan dalam format JSON di database.

  JsonDocument doc;
  JsonObject payload = doc["payload"].to<JsonObject>();

  // Isi payload dengan data sensor Anda:
  payload["suhu"] = round(temperature * 100.0) / 100.0;
  payload["kelembapan"] = round(humidity * 100.0) / 100.0;

  // Tambahkan field lain sesuai kebutuhan:
  // payload["tekanan"] = pressure;
  // payload["cahaya"] = lightLevel;
  // payload["ph"] = phValue;
  // payload["tds"] = tdsValue;

  // Serialize JSON
  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("Sending data: " + jsonString);

  // -----------------------------------------------
  // KIRIM HTTP POST KE API
  // -----------------------------------------------
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", API_KEY);

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Response code: ");
      Serial.println(httpResponseCode);
      Serial.println("Response: " + response);

      if (httpResponseCode == 201) {
        Serial.println("✅ Data sent successfully!");
      } else {
        Serial.println("⚠️ Unexpected response code");
      }
    } else {
      Serial.print("❌ Error sending data: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("❌ WiFi not connected!");
  }
}
```

### Kode ESP8266 (NodeMCU)

Untuk ESP8266, gunakan library yang berbeda:

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// Konfigurasi sama seperti ESP32
const char* WIFI_SSID     = "NAMA_WIFI_ANDA";
const char* WIFI_PASSWORD = "PASSWORD_WIFI_ANDA";
const char* API_URL = "http://IP_SERVER_ANDA:3001/api/sensor-data";
const char* API_KEY = "API_KEY_DEVICE_ANDA";

const unsigned long SEND_INTERVAL = 30000;
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendData();
    lastSendTime = millis();
  }
  delay(100);
}

void sendData() {
  if (WiFi.status() != WL_CONNECTED) return;

  // Baca sensor Anda di sini
  float suhu = 25.0 + random(0, 100) / 10.0;
  float kelembapan = 50.0 + random(0, 300) / 10.0;

  // Buat JSON
  JsonDocument doc;
  JsonObject payload = doc["payload"].to<JsonObject>();
  payload["suhu"] = suhu;
  payload["kelembapan"] = kelembapan;

  String jsonString;
  serializeJson(doc, jsonString);

  // Kirim ke API
  WiFiClient client;
  HTTPClient http;
  http.begin(client, API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  int code = http.POST(jsonString);
  Serial.printf("HTTP %d: %s\n", code, http.getString().c_str());

  http.end();
}
```

### Library yang Dibutuhkan (Arduino IDE)

Install melalui **Library Manager** di Arduino IDE:

| Library        | Untuk                    |
|----------------|--------------------------|
| ArduinoJson    | Serialisasi JSON         |
| DHT sensor lib | Sensor DHT11/DHT22       |
| WiFi           | Built-in ESP32           |
| ESP8266WiFi    | Built-in ESP8266         |
| HTTPClient     | HTTP request             |

### Langkah-Langkah Setup Device

1. **Daftarkan device** di Admin Dashboard → Device Management → "+ Add Device"
2. **Salin API Key** yang digenerate untuk device tersebut
3. **Masukkan konfigurasi** ke kode Arduino:
   - `WIFI_SSID` — Nama WiFi
   - `WIFI_PASSWORD` — Password WiFi
   - `API_URL` — URL backend Anda (contoh: `http://192.168.1.100:3001/api/sensor-data`)
   - `API_KEY` — API Key dari langkah 2
4. **Upload** kode ke board
5. **Pantau** Serial Monitor untuk memastikan data terkirim
6. **Lihat data** di Homepage Kalibrasi

### Testing dengan curl

Untuk testing tanpa device fisik:

```bash
curl -X POST http://localhost:3001/api/sensor-data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "payload": {
      "suhu": 28.5,
      "kelembapan": 65.2,
      "tekanan": 1013.25
    }
  }'
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Upload folder dist/ ke hosting
```

Set environment variable:
```
VITE_API_URL=https://your-backend-domain.com/api
```

### Backend (VPS/Cloud)

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

Set environment variables pada server sesuai `.env`.

## 📝 Environment Variables

### Backend (`.env`)

| Variable       | Required | Description                     | Example                                         |
|----------------|----------|---------------------------------|-------------------------------------------------|
| `DATABASE_URL` | ✅       | MySQL connection string         | `mysql://user:pass@localhost:3306/kalibrasi`     |
| `JWT_SECRET`   | ✅       | Secret key untuk JWT            | `super-secret-random-string-here`               |
| `PORT`         | ❌       | Port server (default: 3001)     | `3001`                                          |

### Frontend (`.env`)

| Variable       | Required | Description                     | Example                                         |
|----------------|----------|---------------------------------|-------------------------------------------------|
| `VITE_API_URL` | ❌       | Backend API URL                 | `http://localhost:3001/api`                      |

## 📄 License

MIT License

---

Made with ❤️ by **Biru Langit**
