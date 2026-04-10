//import express
const express = require('express');

//init express router
const router = express.Router();

//import verifyToken middleware (JWT)
const verifyToken = require('../middlewares/auth');

//import verifyAdmin middleware (admin check)
const verifyAdmin = require('../middlewares/verifyAdmin');

//import verifyApiKey middleware (API Key for sensor devices)
const verifyApiKey = require('../middlewares/verifyApiKey');

//import controllers
const registerController = require('../controllers/RegisterController');
const loginController = require('../controllers/LoginController');
const userController = require('../controllers/UserController');
const deviceController = require('../controllers/DeviceController');
const sensorDataController = require('../controllers/SensorDataController');

//import validators
const { validateRegister, validateLogin } = require('../utils/validators/auth');
const { validateUser } = require('../utils/validators/user');
const { validateDevice } = require('../utils/validators/device');
const { validateSensorData } = require('../utils/validators/sensorData');

// ==========================================
// AUTH ROUTES (public)
// ==========================================

//define route for register
router.post('/register', validateRegister, registerController.register);

//define route for login
router.post('/login', validateLogin, loginController.login);

// ==========================================
// USER MANAGEMENT ROUTES (admin only)
// ==========================================

//define route for list all users
router.get('/admin/users', verifyToken, verifyAdmin, userController.findUsers);

//define route for create user
router.post('/admin/users', verifyToken, verifyAdmin, validateUser, userController.createUser);

//define route for get user by ID
router.get('/admin/users/:id', verifyToken, verifyAdmin, userController.findUserById);

//define route for update user
router.put('/admin/users/:id', verifyToken, verifyAdmin, validateUser, userController.updateUser);

//define route for delete (deactivate) user
router.delete('/admin/users/:id', verifyToken, verifyAdmin, userController.deleteUser);

//define route for reactivate user
router.put('/admin/users/:id/reactivate', verifyToken, verifyAdmin, userController.reactivateUser);

// ==========================================
// DEVICE MANAGEMENT ROUTES (admin only)
// ==========================================

//define route for list all devices
router.get('/admin/devices', verifyToken, verifyAdmin, deviceController.findDevices);

//define route for create device
router.post('/admin/devices', verifyToken, verifyAdmin, validateDevice, deviceController.createDevice);

//define route for get device by ID
router.get('/admin/devices/:id', verifyToken, verifyAdmin, deviceController.findDeviceById);

//define route for update device
router.put('/admin/devices/:id', verifyToken, verifyAdmin, validateDevice, deviceController.updateDevice);

//define route for regenerate API key
router.post('/admin/devices/:id/regenerate-key', verifyToken, verifyAdmin, deviceController.regenerateApiKey);

//define route for delete (deactivate) device
router.delete('/admin/devices/:id', verifyToken, verifyAdmin, deviceController.deleteDevice);

//define route for reactivate device
router.put('/admin/devices/:id/reactivate', verifyToken, verifyAdmin, deviceController.reactivateDevice);

// ==========================================
// SENSOR DATA INGESTION ROUTE (device auth - API Key)
// ==========================================

//define route for store sensor data (sent by sensor devices)
router.post('/sensor-data', verifyApiKey, validateSensorData, sensorDataController.storeSensorData);

// ==========================================
// PUBLIC DEVICE LIST (for homepage device selector)
// ==========================================

//define route for get public device list (no sensitive data)
router.get('/devices', deviceController.getPublicDevices);

// ==========================================
// SENSOR DATA RETRIEVAL ROUTES (public)
// ==========================================

//define route for get all sensor data (with filters)
router.get('/sensor-data', sensorDataController.getSensorData);

//define route for get sensor data by ID
router.get('/sensor-data/:id', sensorDataController.getSensorDataById);

//define route for get sensor data by device ID
router.get('/sensor-data/device/:deviceId', sensorDataController.getSensorDataByDevice);

// ==========================================
// SENSOR DATA DELETE ROUTE (admin only)
// ==========================================

//define route for delete sensor data
router.delete('/admin/sensor-data/:id', verifyToken, verifyAdmin, sensorDataController.deleteSensorData);

//export router
module.exports = router;
