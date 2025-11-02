import multer from 'multer';

// Define the 4MB size limit in bytes
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4,194,304 bytes

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage();

// File filter to accept only common image types
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, or GIF allowed.'), false);
  }
};

// Create the upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // Apply the 4MB limit
  },
});

export default upload;
