const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const config = require('../config/config');
const AppError = require('./appError');

cloudinary.config(config.COULDINARY_CONFIG);

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false,
        );
    }
};

const createUploader = (folder, publicId) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder,
            public_id: publicId,
        },
    });

    const uploader = multer({
        storage,
        fileFilter: multerFilter,
    });
    return uploader;
};

const deleteCloudinaryImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return 1;
    } catch (err) {
        console.log(err);
        return 0;
    }
};

module.exports = {
    createUploader,
    deleteCloudinaryImage,
};
