//import prisma client
const prisma = require('../prisma/client');

//import validationResult from express-validator
const { validationResult } = require('express-validator');

//import timezone helper
const { getWIBTime } = require('../utils/timezone');

//function storeSensorData - receive sensor data from device
const storeSensorData = async (req, res) => {

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

        //device info is attached by verifyApiKey middleware
        const device = req.device;

        //store sensor data
        const sensorData = await prisma.sensorData.create({
            data: {
                deviceId: device.id,
                payload: req.body.payload,
                createdAt: getWIBTime(),
            },
        });

        //send response
        res.status(201).send({
            success: true,
            message: 'Sensor data stored successfully',
            data: {
                id: sensorData.id,
                deviceId: sensorData.deviceId,
                deviceName: device.name,
                payload: sensorData.payload,
                createdAt: sensorData.createdAt,
            },
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function getSensorData - get all sensor data (with optional filters)
const getSensorData = async (req, res) => {
    try {

        //get query parameters for filtering
        const { deviceId, limit, offset, startDate, endDate } = req.query;

        //build where clause
        const where = {};

        if (deviceId) {
            where.deviceId = Number(deviceId);
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        //get sensor data without device info per row
        const sensorData = await prisma.sensorData.findMany({
            where: where,
            select: {
                id: true,
                deviceId: true,
                payload: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit ? Number(limit) : 100,
            skip: offset ? Number(offset) : 0,
        });

        //get unique device IDs from results and fetch device info once
        const deviceIds = [...new Set(sensorData.map(d => d.deviceId))];
        const devices = await prisma.device.findMany({
            where: { id: { in: deviceIds } },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });

        //get total count
        const total = await prisma.sensorData.count({ where: where });

        //do not strip deviceId from each data item so the frontend can display the device name
        const cleanData = sensorData;

        //send response
        res.status(200).send({
            success: true,
            message: 'Get sensor data successfully',
            devices: devices,
            data: cleanData,
            meta: {
                total: total,
                limit: limit ? Number(limit) : 100,
                offset: offset ? Number(offset) : 0,
            },
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function getSensorDataById
const getSensorDataById = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //get sensor data by ID
        const sensorData = await prisma.sensorData.findUnique({
            where: {
                id: Number(id),
            },
            select: {
                id: true,
                deviceId: true,
                payload: true,
                createdAt: true,
            },
        });

        //not found
        if (!sensorData) {
            return res.status(404).send({
                success: false,
                message: 'Sensor data not found',
            });
        }

        //get device info once at the top
        const device = await prisma.device.findUnique({
            where: { id: sensorData.deviceId },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });

        //send response — device info at top, data without device duplication
        res.status(200).send({
            success: true,
            message: `Get sensor data by ID: ${id}`,
            device: device,
            data: {
                id: sensorData.id,
                payload: sensorData.payload,
                createdAt: sensorData.createdAt,
            },
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function getSensorDataByDevice - get sensor data for a specific device
const getSensorDataByDevice = async (req, res) => {

    //get device ID from params
    const { deviceId } = req.params;
    const { limit, offset, startDate, endDate } = req.query;

    try {

        //check if device exists and get device info
        const device = await prisma.device.findFirst({
            where: {
                id: Number(deviceId),
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });

        if (!device) {
            return res.status(404).send({
                success: false,
                message: 'Device not found',
            });
        }

        //build where clause
        const where = { deviceId: Number(deviceId) };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        //get sensor data — only id, payload, createdAt (no device info per row)
        const sensorData = await prisma.sensorData.findMany({
            where: where,
            select: {
                id: true,
                payload: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit ? Number(limit) : 100,
            skip: offset ? Number(offset) : 0,
        });

        //get total count
        const total = await prisma.sensorData.count({ where: where });

        //send response — device info at top, data tanpa duplikasi
        res.status(200).send({
            success: true,
            message: `Get sensor data for device: ${device.name}`,
            device: device,
            data: sensorData,
            meta: {
                total: total,
                limit: limit ? Number(limit) : 100,
                offset: offset ? Number(offset) : 0,
            },
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

//function deleteSensorData
const deleteSensorData = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //check if sensor data exists
        const existingData = await prisma.sensorData.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!existingData) {
            return res.status(404).send({
                success: false,
                message: 'Sensor data not found',
            });
        }

        //hard delete sensor data
        await prisma.sensorData.delete({
            where: {
                id: Number(id),
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: 'Sensor data deleted successfully',
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports = {
    storeSensorData,
    getSensorData,
    getSensorDataById,
    getSensorDataByDevice,
    deleteSensorData,
};
