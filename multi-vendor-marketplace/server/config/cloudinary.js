const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadBuffer = (buffer, folder = 'marketplace') => {
  return new Promise((resolve, reject) => {
    // If cloudinary credentials are not set, avoid crashing and return an error or placeholder
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      return reject(new Error('Cloudinary credentials not configured in environment variables'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = { cloudinary, uploadBuffer };
