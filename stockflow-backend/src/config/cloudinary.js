const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Check if env vars exist
const hasCloudinaryConfig = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Fallback: local disk storage if Cloudinary not configured
let upload;

if (hasCloudinaryConfig) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'stockflow-products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
  });
  upload = multer({ storage });
} else {
  // Local storage fallback
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + '-' + file.originalname);
    },
  });
  upload = multer({ storage });
}

module.exports = { cloudinary, upload };