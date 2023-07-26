const Entry = require('../models/entry');
const User = require('../models/user');
const UserServices = require('../services/userservices');
const S3Services = require('../services/s3services');
// const FilesDownloaded = require('../models/filesdownloaded');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
require('dotenv').config();
let pageLimit;

const getEntriesByDate = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        pageLimit = +req.query.pageLimit || 10;

        const { date } = req.query;

        console.log(date);

        const query = {
            userId: req.user._id,
            date: new Date(date).toISOString().split('T')[0]
        };

        const skip = (page - 1) * pageLimit;
        const entries = await Entry.find(query).skip(skip).limit(pageLimit);

        const allEntries = await Entry.find(query);

        const total = allEntries.length;

        const pageData = {
            currentPage: page,
            hasNextPage: (page * pageLimit) < total,
            nextPage: page + 1,
            hasPreviousPage: (page > 1),
            previousPage: page - 1,
            lastPage: Math.ceil(total / pageLimit)
        }
        return res.status(200).json({
            entries: entries,
            pageData: pageData,
            success: true
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Some error occurred", success: false });
    }
}

const getEntriesByMonth = async (req, res, next) => {
    try {
        var session = await mongoose.startSession();
        session.startTransaction();

        const page = +req.query.page || 1;
        pageLimit = +req.query.pageLimit || 10;

        let { month, year } = req.query;

        month = Number(month);
        year = Number(year);

        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 1);

        const pipeline = [
            {
                $match: {
                    userId: req.user._id,
                    date: {
                        $gte: startOfMonth,
                        $lt: endOfMonth
                    },
                },
            },
            {
                $sort: { date: 1 }
            },
            {
                $skip: (page - 1) * pageLimit
            },
            {
                $limit: pageLimit
            },
        ];

        const entries = await Entry.aggregate(pipeline).session(session);

        const pipeline2 = [
            {
                $match: {
                    userId: req.user._id,
                    date: {
                        $gte: startOfMonth,
                        $lt: endOfMonth
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ];

        const result = await Entry.aggregate(pipeline2).session(session);

        const total = result.length > 0 ? result[0].count : 0;

        await session.commitTransaction();
        session.endSession();

        const pageData = {
            currentPage: page,
            hasNextPage: (page * pageLimit) < total,
            nextPage: page + 1,
            hasPreviousPage: (page > 1),
            previousPage: page - 1,
            lastPage: Math.ceil(total / pageLimit)
        }
        return res.status(200).json({
            entries: entries,
            pageData: pageData,
            success: true
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Something went wrong!', error);
        throw error;
    }
}

const getEntriesByYear = async (req, res, next) => {
    try {
        var session = await mongoose.startSession();
        session.startTransaction();

        let { year } = req.query;
        year = Number(year);

        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year + 1, 0, 1);

        console.log(startOfYear.toString(), endOfYear.toString());

        const pipeline = [
            {
                $match: {
                    userId: req.user._id,
                    date: {
                        $gte: startOfYear,
                        $lte: endOfYear
                    },
                },
            },
            {
                $sort: { date: 1 }
            }
        ];

        const entries = await Entry.aggregate(pipeline).session(session);

        console.log(entries);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            entries: entries,
            success: true
        });
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
}

const getAllEntries = async (req, res, next) => {
    try {
        var session = await mongoose.startSession();
        session.startTransaction();

        const page = +req.query.page || 1;
        pageLimit = +req.query.pageLimit || 10;

        const entries = await Entry.find({ userId: req.user._id })
            .sort({ date: -1 })
            .skip((page-1)*pageLimit)
            .limit(pageLimit)
            .session(session);

        const total = await Entry.countDocuments({ userId: req.user._id }).session(session);

        const pageData = {
            currentPage: page,
            hasNextPage: (page * pageLimit) < total,
            nextPage: page + 1,
            hasPreviousPage: (page > 1),
            previousPage: page - 1,
            lastPage: Math.ceil(total / pageLimit)
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            entries: entries,
            pageData: pageData,
            success: true
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);

        return res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
}

const postAddEntry = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const entryType = req.body.entryType;

    try {
        const user = req.user;

        const newEntry = new Entry({
            amount: req.body.amount,
            description: req.body.description,
            category: req.body.category,
            date: req.body.date,
            entryType: entryType,
            userId: req.user._id
        });

        await newEntry.save({ session });

        if (entryType === 'expense')
            user.totalExpense = Number(user.totalExpense) + Number(req.body.amount);
        else
            user.totalIncome = Number(user.totalIncome) + Number(req.body.amount);

        user.totalSavings = Number(user.totalIncome) - Number(user.totalExpense);

        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        return res.status(500).json({ message: "Some error occurred", success: false });
    }
}

const deleteEntry = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const entryId = req.params.id;

        if (entryId == undefined || entryId.length === 0)
            return res.status(400).json({ message: 'Bad request', success: false });

        const user = req.user;

        const entries = await user.getEntries({ where: { id: entryId } });
        const entry = entries[0];

        if (entry.entryType === 'expense')
            user.totalExpense = Number(user.totalExpense) - Number(entry.amount);
        else
            user.totalIncome = Number(user.totalIncome) - Number(entry.amount);

        user.totalSavings = Number(user.totalIncome) - Number(user.totalExpense);

        await entry.destroy({ transaction: t });

        await user.save({ transaction: t });

        await t.commit();

        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        await t.rollback();
        return res.status(500).json({ message: "Some error occurred", success: false });
    }
}

const downloadEntries = async (req, res) => {
    try {
        const entries = await UserServices.getEntries(req);
        if (entries.length === 0)
            return res.status(404).json({ message: 'No entries to download', success: false });
        const stringifiedEntries = JSON.stringify(entries);
        const dateDownloaded = new Date();
        const filename = `Entry${req.user.id}/${dateDownloaded}.txt`;
        const fileUrl = await S3Services.uploadToS3(stringifiedEntries, filename);

        await FilesDownloaded.create({
            fileUrl: fileUrl,
            dateDownloaded: dateDownloaded,
            userId: req.user.id
        });

        return res.status(200).json({ fileUrl: fileUrl, success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ fileUrl: '', success: false, err: err });
    }
}

module.exports = {
    getEntriesByDate,
    getEntriesByMonth,
    getEntriesByYear,
    getAllEntries,
    postAddEntry,
    deleteEntry,
    downloadEntries
}