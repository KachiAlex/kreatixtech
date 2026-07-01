import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Parse Cloudinary URL if provided (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
function parseCloudinaryUrl(url) {
  if (!url) return null;
  try {
    const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      return { api_key: match[1], api_secret: match[2], cloud_name: match[3] };
    }
  } catch (err) {
    console.error('Error parsing Cloudinary URL:', err);
  }
  return null;
}

const parsedConfig = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
if (parsedConfig) {
  cloudinary.config(parsedConfig);
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// All uploads go through memory storage — we pipe to Cloudinary manually
const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadPortfolioImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Helper: upload a buffer to Cloudinary and return the result
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
}

export { cloudinary, upload, uploadPortfolioImage, uploadBufferToCloudinary };
