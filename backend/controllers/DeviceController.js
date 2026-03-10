//import prisma client
const prisma = require('../prisma/client');

//import validationResult from express-validator
const { validationResult } = require('express-validator');

//import timezone helper
const { getWIBTime } = require('../utils/timezone');

//import API key generator
const { generateApiKey } = require('../utils/apiKeyGenerator');

//function findDevices - get all active devices
const findDevices = async (req, res) => {
    try {

        //get all active devices from database
        const devices = await prisma.device.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                apiKey: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                id: 'desc',
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: 'Get all devices successfully',
            data: devices,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function createDevice - register a new sensor device
const createDevice = async (req, res) => {

    //check validation result
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation error',
            errors: errors.array(),
        });
    }

    try {

        //generate unique API key
        const apiKey = generateApiKey();

        //insert new device
        const device = await prisma.device.create({
            data: {
                name: req.body.name,
                description: req.body.description || null,
                apiKey: apiKey,
                createdAt: getWIBTime(),
                updatedAt: getWIBTime(),
            },
        });

        //send response with the generated API key
        res.status(201).send({
            success: true,
            message: 'Device registered successfully. Save the API key, it will be used for authentication.',
            data: device,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function findDeviceById
const findDeviceById = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //get device by ID (only active)
        const device = await prisma.device.findFirst({
            where: {
                id: Number(id),
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                apiKey: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        //device not found or inactive
        if (!device) {
            return res.status(404).send({
                success: false,
                message: 'Device not found',
            });
        }

        //send response
        res.status(200).send({
            success: true,
            message: `Get device by ID: ${id}`,
            data: device,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function updateDevice
const updateDevice = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    //check validation result
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation error',
            errors: errors.array(),
        });
    }

    try {

        //check if device exists
        const existingDevice = await prisma.device.findFirst({
            where: {
                id: Number(id),
                isActive: true,
            },
        });

        if (!existingDevice) {
            return res.status(404).send({
                success: false,
                message: 'Device not found',
            });
        }

        //update device
        const device = await prisma.device.update({
            where: {
                id: Number(id),
            },
            data: {
                name: req.body.name,
                description: req.body.description || null,
                updatedAt: getWIBTime(),
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: 'Device updated successfully',
            data: device,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function regenerateApiKey - generate a new API key for a device
const regenerateApiKey = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //check if device exists and is active
        const existingDevice = await prisma.device.findFirst({
            where: {
                id: Number(id),
                isActive: true,
            },
        });

        if (!existingDevice) {
            return res.status(404).send({
                success: false,
                message: 'Device not found or deactivated',
            });
        }

        //generate new API key
        const newApiKey = generateApiKey();

        //update device with new API key
        const device = await prisma.device.update({
            where: {
                id: Number(id),
            },
            data: {
                apiKey: newApiKey,
                updatedAt: getWIBTime(),
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: 'API key regenerated successfully. Save the new API key.',
            data: device,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function deleteDevice (soft delete - deactivate)
const deleteDevice = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //check if device exists and is active
        const existingDevice = await prisma.device.findFirst({
            where: {
                id: Number(id),
                isActive: true,
            },
        });

        if (!existingDevice) {
            return res.status(404).send({
                success: false,
                message: 'Device not found or already deactivated',
            });
        }

        //soft delete: set isActive to false and record deactivation time
        await prisma.device.update({
            where: {
                id: Number(id),
            },
            data: {
                isActive: false,
                deactivatedAt: getWIBTime(),
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: 'Device deactivated successfully',
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function reactivateDevice
const reactivateDevice = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //check if device exists and is currently deactivated
        const existingDevice = await prisma.device.findFirst({
            where: {
                id: Number(id),
                isActive: false,
            },
        });

        if (!existingDevice) {
            return res.status(404).send({
                success: false,
                message: 'Device not found or already active',
            });
        }

        //reactivate: set isActive to true and clear deactivatedAt
        await prisma.device.update({
            where: {
                id: Number(id),
            },
            data: {
                isActive: true,
                deactivatedAt: null,
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: 'Device reactivated successfully',
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports = {
    findDevices,
    createDevice,
    findDeviceById,
    updateDevice,
    regenerateApiKey,
    deleteDevice,
    reactivateDevice,
};
