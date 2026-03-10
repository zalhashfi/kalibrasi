const { body } = require('express-validator');

//validate create device
const validateDevice = [
    body('name')
        .notEmpty().withMessage('Device name is required'),
    body('description')
        .optional(),
];

module.exports = { validateDevice };
