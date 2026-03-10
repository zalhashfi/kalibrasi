const { body } = require('express-validator');

//validate sensor data payload
const validateSensorData = [
    body('payload')
        .notEmpty().withMessage('Payload is required')
        .isObject().withMessage('Payload must be a JSON object'),
];

module.exports = { validateSensorData };
