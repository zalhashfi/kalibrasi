//import express
const express = require("express");

//import prisma client
const prisma = require("../prisma/client");

// Import validationResult from express-validator
const { validationResult } = require("express-validator");

//import bcrypt
const bcrypt = require("bcryptjs");

//import timezone helper
const { getWIBTime } = require("../utils/timezone");

//function findUsers
const findUsers = async (req, res) => {
    try {

        //get all active users from database
        const users = await prisma.user.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                isActive: true,
            },
            orderBy: {
                id: "desc",
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: "Get all users successfully",
            data: users,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

//function createUser
const createUser = async (req, res) => {

    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try {

        //insert data
        const user = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                isAdmin: req.body.isAdmin || false,
                createdAt: getWIBTime(),
                updatedAt: getWIBTime(),
            },
        });

        res.status(201).send({
            success: true,
            message: "User created successfully",
            data: user,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

//function findUserById
const findUserById = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //get user by ID (only active users)
        const user = await prisma.user.findFirst({
            where: {
                id: Number(id),
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                isActive: true,
            },
        });

        //user not found or inactive
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        //send response
        res.status(200).send({
            success: true,
            message: `Get user By ID :${id}`,
            data: user,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

//function updateUser
const updateUser = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try {

        //update user
        const user = await prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                isAdmin: req.body.isAdmin || false,
                updatedAt: getWIBTime(),
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: 'User updated successfully',
            data: user,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

//function deleteUser (soft delete - deactivate account)
const deleteUser = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //check if user exists and is active
        const existingUser = await prisma.user.findFirst({
            where: {
                id: Number(id),
                isActive: true,
            },
        });

        if (!existingUser) {
            return res.status(404).send({
                success: false,
                message: 'User not found or already deactivated',
            });
        }

        //soft delete: set isActive to false and record deactivation time
        await prisma.user.update({
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
            message: 'User deactivated successfully',
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }

};

//function reactivateUser (activate deactivated account)
const reactivateUser = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //check if user exists and is currently deactivated
        const existingUser = await prisma.user.findFirst({
            where: {
                id: Number(id),
                isActive: false,
            },
        });

        if (!existingUser) {
            return res.status(404).send({
                success: false,
                message: 'User not found or already active',
            });
        }

        //reactivate: set isActive to true and clear deactivatedAt
        await prisma.user.update({
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
            message: 'User reactivated successfully',
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }

};

module.exports = { findUsers, createUser, findUserById, updateUser, deleteUser, reactivateUser };
