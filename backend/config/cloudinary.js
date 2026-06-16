import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Parse Cloudinary URL if provided (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
function parseCloudinaryUrl(url) {
  if (!url) return null;
  try {
    const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      return {
        api_key: match[1],
        api_secret: match[2],
        cloud_name: match[3]
      };
    }
  } catch (err) {
    console.error('Error parsing Cloudinary URL:', err);
  }
  return null;
}

const cloudinaryUrl = process.env.CLOUDINARY_URL;
const parsedConfig = parseCloudinaryUrl(cloudinaryUrl);

if (parsedConfig) {
  cloudinary.config(parsedConfig);
} else {
  // Fallback to individual env vars
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kreatix-vapt',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'csv'],
    transformation: [{ quality: 'auto' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export { cloudinary, upload };
