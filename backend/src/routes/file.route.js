import express from 'express';
import multer from 'multer';
import { protectRoute } from '../middlewares/protectRoute.js';
import { uploadFiles, streamFile, getFileInfo, uploadConfig, streamFileByWorkspace, updateFile } from '../controllers/file.controller.js';

const router = express.Router();

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  ...uploadConfig,
});

// Upload files
router.post('/', protectRoute, upload.array('files', 10), uploadFiles);

router.get('/:workspaceId/:id/:filename', protectRoute, streamFileByWorkspace)

// Get file metadata (must be before /:id route)
router.get('/:id/info', protectRoute, getFileInfo);

// Update file metadata (must be before /:id route)
router.patch('/:id', protectRoute, updateFile);

// Stream/download file
router.get('/:id', protectRoute, streamFile);


export default router;

