const entryController = require('../controllers/entry');
const userAuthentication = require('../middleware/userauthentication');
const express = require('express');
const router = express.Router();

router.get('/entries/date', userAuthentication.authenticate, entryController.getEntriesByDate);

router.get('/entries/month', userAuthentication.authenticate, entryController.getEntriesByMonth);

router.get('/entries/year', userAuthentication.authenticate, entryController.getEntriesByYear);

router.get('/entries/all', userAuthentication.authenticate, entryController.getAllEntries);

router.post('/entries', userAuthentication.authenticate, entryController.postAddEntry);

router.delete('/entries/:id', userAuthentication.authenticate, entryController.deleteEntry);

// router.put('/entries/:id', userAuthentication.authenticate, entryController.editEntry);

router.get('/entries/downloadAll/', userAuthentication.authenticate, entryController.downloadEntries);

module.exports = router;