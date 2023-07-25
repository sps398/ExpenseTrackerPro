// const Entry = require('../models/entry');
// const User = require('../models/user');
// const sequelize = require('../util/database');
// const UserServices = require('../services/userservices');
// const S3Services = require('../services/s3services');
// const FilesDownloaded = require('../models/filesdownloaded');
const AWS = require('aws-sdk');
require('dotenv').config();
let pageLimit;

const getEntries = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        pageLimit = +req.query.pageLimit || 10;

        console.log(req.query);

        const { date, month, year } = req.query;

        let type, data, entries;
        if(date) {
            type = 'date';
            data = new Date(date).toISOString().split('T')[0];
            entries = await getEntriesByDateOrMonth(req, 'date', data, page);
        }
        else if(month) {
            type = 'month';
            data = Number(req.query.month)+1;
            entries = await getEntriesByDateOrMonth(req, 'month', data, page);
        }
        else if(year) {
            type = 'year';
            data = Number(req.query.year);
            entries = await getEntriesByYear(req, data, page);
        }

        let totalEntries, total;
        
        if(!date && !month && !year) {
            totalEntries = await req.user.countEntries();

            total = totalEntries;

            entries = await getAllEntries(req, page);
        }
        
        else {
            totalEntries = await UserServices.getEntries(req, {
                where: sequelize.where(sequelize.fn(type, sequelize.col("date")), data),
                attributes: [[sequelize.fn('COUNT', sequelize.col('date')), 'total']]
            });

            total = totalEntries[0].dataValues.total;
        }

        const pageData = {
            currentPage: page,
            hasNextPage: (page*pageLimit) < total,
            nextPage: page+1,
            hasPreviousPage: (page > 1),
            previousPage: page-1,
            lastPage: Math.ceil(total/pageLimit)
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

function getEntriesByDateOrMonth(req, type, data, page) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = req.user;
            const id = user.id;

            const entries = await UserServices.getEntries(req, {
                where: sequelize.where(sequelize.fn(type, sequelize.col("date")), data),
                offset: (page-1)*pageLimit,
                limit: pageLimit
            });
            resolve(entries);
        } catch(err) {
            console.log(err);
            reject(err);
        }
    });
}

function filterUserData(column, value, page, pageLimit, userData) {
    const filteredData = userData.filter((user) => {
        console.log(user[column] + " " + value);
        return user[column] === value;
    });
    console.log('Filtered Data ' + filteredData); 
    const offset = (page - 1) * pageLimit;
    const limitedData = filteredData.slice(offset, offset + pageLimit);
    return limitedData;
  }

function getEntriesByYear(req, data, page) {
    return new Promise(async (resolve, reject) => {
        try {
            const entries = await UserServices.getEntries(req, {
                where: sequelize.where(sequelize.fn('year', sequelize.col("date")), data),
            });
            resolve(entries);
        } catch(err) {
            console.log(err);
            reject(err);
        }
    });
}

function getAllEntries(req, page) {
    return new Promise(async (resolve, reject) => {
        try {
            const entries = await UserServices.getEntries(req, {
                offset: (page-1)*pageLimit,
                limit: pageLimit
            });
            resolve(entries);
        } catch(err) {
            console.log(err);
            reject(err);
        }
    });
}

const postAddEntry = async (req, res, next) => {
    const t = await sequelize.transaction();

    const entryType = req.body.entryType;

    try {
        const user = req.user;

        const newEntry = {
            amount: req.body.amount,
            description: req.body.description,
            category: req.body.category,
            date: req.body.date,
            entryType: entryType
        }
        
        await user.createEntry(newEntry, { transaction: t });

        if(entryType === 'expense')
            user.totalExpense = Number(user.totalExpense) + Number(req.body.amount);
        else
            user.totalIncome = Number(user.totalIncome) + Number(req.body.amount);

        user.totalSavings = Number(user.totalIncome) - Number(user.totalExpense);
        
        await user.save({ transaction: t });

        await t.commit();

        return res.status(200).json({ success: true });
    } catch (err) {
        await t.rollback();
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
        
        const entries = await user.getEntries({ where: { id:entryId } });
        const entry = entries[0];

        if(entry.entryType === 'expense')
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
        if(entries.length === 0)
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
    } catch(err) {
        console.log(err);
        return res.status(500).json({ fileUrl: '', success: false, err: err });
    }
}
    
module.exports = {
    getEntries,
    postAddEntry,
    deleteEntry,
    downloadEntries
}