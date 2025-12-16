const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');

const mult = require('multer');
const path = require('path');

// Multer Config
const storage = mult.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }
});

const upload = mult({ storage: storage });

router.get('/', propertyController.getProperties);
router.get('/my-properties', auth, propertyController.getAgentProperties);
router.post('/', [auth, upload.single('image')], propertyController.createProperty);
router.get('/:id', propertyController.getProperty);

module.exports = router;
