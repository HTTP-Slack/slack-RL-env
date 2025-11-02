import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/**
 * Get GridFS bucket instance
 * @returns {GridFSBucket}
 */
export const getBucket = () => {
  const db = mongoose.connection.db;
  return new GridFSBucket(db, { bucketName: 'files' });
};

/**
 * Upload a file stream to GridFS
 * @param {ReadableStream} stream - File stream to upload
 * @param {string} filename - Original filename
 * @param {string} contentType - MIME type
 * @param {Object} metadata - Additional metadata (organisation, uploader, channel, conversation)
 * @returns {Promise<ObjectId>} - GridFS file ID
 */
export const uploadStream = async (stream, filename, contentType, metadata) => {
  const bucket = getBucket();
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata,
    });

    stream.pipe(uploadStream);

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });
  });
};

/**
 * Open download stream for a file
 * @param {ObjectId|string} fileId - GridFS file ID
 * @returns {GridFSBucketReadStream}
 */
export const openDownloadStream = (fileId) => {
  const bucket = getBucket();
  const id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  return bucket.openDownloadStream(id);
};

/**
 * Delete a file from GridFS
 * @param {ObjectId|string} fileId - GridFS file ID
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileId) => {
  const bucket = getBucket();
  const id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  await bucket.delete(id);
};

/**
 * Find file metadata by ID
 * @param {ObjectId|string} fileId - GridFS file ID
 * @returns {Promise<Object|null>} - File document or null
 */
export const findFileById = async (fileId) => {
  const bucket = getBucket();
  const id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  const files = bucket.find({ _id: id });
  const fileArray = await files.toArray();
  return fileArray.length > 0 ? fileArray[0] : null;
};

export { MAX_FILE_SIZE };

