const entryController = require('../controllers/entry');
// const leaderboardController = require('../controllers/premium');
const userAuthentication = require('../middleware/userauthentication');
const express = require('express');
const router = express.Router();

router.get('/entries/date', userAuthentication.authenticate, entryController.getEntriesByDate);

router.get('/entries/month', userAuthentication.authenticate, entryController.getEntriesByMonth);

router.get('/entries/year', userAuthentication.authenticate, entryController.getEntriesByYear);

router.get('/entries/all', userAuthentication.authenticate, entryController.getAllEntries);

router.post('/add-entry', userAuthentication.authenticate, entryController.postAddEntry);

// router.get('/delete-entry/:id', userAuthentication.authenticate, entryController.deleteEntry);

// router.get('/download/', userAuthentication.authenticate, entryController.downloadEntries);

module.exports = router;