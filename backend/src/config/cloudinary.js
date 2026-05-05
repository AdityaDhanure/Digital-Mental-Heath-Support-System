// src/config/cloudinary.js - Cloudinary Media Storage Configuration

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import logger from '../utils/logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration for different resource types
const createStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `mental-health/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    }
  });
};

// Image storage (for profile pictures, resource thumbnails)
const imageStorage = createStorage('images', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Document storage (for PDFs, docs)
const documentStorage = createStorage('documents', ['pdf', 'doc', 'docx']);

// Audio storage (for meditation guides, relaxation audio)
const audioStorage = createStorage('audio', ['mp3', 'wav', 'ogg', 'm4a']);

// Video storage (for educational videos)
const videoStorage = createStorage('videos', ['mp4', 'avi', 'mov', 'webm']);

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,  // 10MB
  audio: 20 * 1024 * 1024,     // 20MB
  video: 100 * 1024 * 1024     // 100MB
};

// Create multer upload middleware
const createUploadMiddleware = (storageType) => {
  let storage, sizeLimit;
  
  switch (storageType) {
    case 'image':
      storage = imageStorage;
      sizeLimit = FILE_SIZE_LIMITS.image;
      break;
    case 'document':
      storage = documentStorage;
      sizeLimit = FILE_SIZE_LIMITS.document;
      break;
    case 'audio':
      storage = audioStorage;
      sizeLimit = FILE_SIZE_LIMITS.audio;
      break;
    case 'video':
      storage = videoStorage;
      sizeLimit = FILE_SIZE_LIMITS.video;
      break;
    default:
      storage = imageStorage;
      sizeLimit = FILE_SIZE_LIMITS.image;
  }
  
  return multer({
    storage: storage,
    limits: {
      fileSize: sizeLimit
    },
    fileFilter: (req, file, cb) => {
      // Additional validation can be added here
      cb(null, true);
    }
  });
};

// Upload handlers
const uploadImage = createUploadMiddleware('image').single('image');
const uploadImages = createUploadMiddleware('image').array('images', 5);
const uploadDocument = createUploadMiddleware('document').single('document');
const uploadAudio = createUploadMiddleware('audio').single('audio');
const uploadVideo = createUploadMiddleware('video').single('video');

/**
 * Upload file to Cloudinary
 * @param {String} filePath - Local file path or buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
const uploadFile = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `mental-health/${options.folder || 'misc'}`,
      resource_type: options.resourceType || 'auto',
      ...options
    });
    
    logger.info('File uploaded to Cloudinary', {
      publicId: result.public_id,
      url: result.secure_url
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration
    };
  } catch (error) {
    logger.error('Cloudinary upload failed:', error);
    throw new Error('File upload failed');
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - File public ID
 * @param {String} resourceType - Resource type (image, video, raw)
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    logger.info('File deleted from Cloudinary', { publicId });
    return result;
  } catch (error) {
    logger.error('Cloudinary deletion failed:', error);
    throw new Error('File deletion failed');
  }
};

/**
 * Generate signed URL for private resources
 * @param {String} publicId - File public ID
 * @param {Object} options - Transformation options
 */
const generateSignedUrl = (publicId, options = {}) => {
  try {
    return cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      ...options
    });
  } catch (error) {
    logger.error('Signed URL generation failed:', error);
    throw new Error('URL generation failed');
  }
};

/**
 * Get file details from Cloudinary
 * @param {String} publicId - File public ID
 * @param {String} resourceType - Resource type
 */
const getFileDetails = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to get file details:', error);
    throw new Error('Could not retrieve file details');
  }
};

/**
 * Upload profile picture with optimization
 * @param {String} filePath - File path
 * @param {String} userId - User ID
 */
const uploadProfilePicture = async (filePath, userId) => {
  return await uploadFile(filePath, {
    folder: 'profile-pictures',
    public_id: `user_${userId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    overwrite: true
  });
};

/**
 * Upload resource media
 * @param {String} filePath - File path
 * @param {Object} metadata - Resource metadata
 */
const uploadResourceMedia = async (filePath, metadata) => {
  const options = {
    folder: `resources/${metadata.category}`,
    public_id: metadata.publicId,
    tags: [metadata.category, metadata.type],
    context: {
      title: metadata.title,
      category: metadata.category
    }
  };
  
  if (metadata.type === 'video') {
    options.resource_type = 'video';
    options.eager = [
      { width: 640, height: 360, crop: 'pad', format: 'mp4' }
    ];
  } else if (metadata.type === 'audio') {
    options.resource_type = 'video'; // Audio is handled as video in Cloudinary
  }
  
  return await uploadFile(filePath, options);
};

export default {
  cloudinary,
  uploadImage,
  uploadImages,
  uploadDocument,
  uploadAudio,
  uploadVideo,
  uploadFile,
  deleteFile,
  generateSignedUrl,
  getFileDetails,
  uploadProfilePicture,
  uploadResourceMedia
};