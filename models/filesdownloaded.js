const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const filesDownloadedSchema = new Schema({
    fileUrl: {
        type: String,
        required: true
    },
    dateDownloaded: {
        type: Date,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const FilesDownloaded = mongoose.model('FilesDownloaded', filesDownloadedSchema);

module.exports = FilesDownloaded;