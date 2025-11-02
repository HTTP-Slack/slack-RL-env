import { uploadStream, openDownloadStream, findFileById, MAX_FILE_SIZE } from '../services/gridfs.service.js';
import Channel from '../models/channel.model.js';
import Conversation from '../models/conversation.model.js';
import Organisation from '../models/organisation.model.js';
import { Readable } from 'stream';

/**
 * Properly encode filename for Content-Disposition header (RFC 5987 compliant)
 */
const getContentDisposition = (filename, disposition = 'attachment') => {
  // Escape quotes and backslashes for quoted-string
  const escapeFilename = (name) => {
    return name.replace(/(["\\])/g, '\\$1');
  };
  
  const encodedFilename = escapeFilename(filename);
  const utf8Filename = encodeURIComponent(filename);
  
  return `${disposition}; filename="${encodedFilename}"; filename*=UTF-8''${utf8Filename}`;
};

/**
 * File filter for allowed file types
 */
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint', // .ppt
  // eBooks
  'application/epub+zip', // .epub
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/mp3',
  'audio/ogg',
  // Video
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo', // .avi
  'video/webm',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
  }
};

/**
 * Multer configuration for file uploads
 */
export const uploadConfig = {
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
};

/**
 * Upload files and return their metadata
 * @route POST /api/files
 * @access Private
 */
export const uploadFiles = async (req, res) => {
  try {
    const { organisation, channelId, conversationId } = req.body;
    const uploaderId = req.user.id;

    // Validation
    if (!organisation) {
      return res.status(400).json({
        success: false,
        message: 'Organisation is required',
      });
    }

    if (!channelId && !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Either channelId or conversationId must be provided',
      });
    }

    if (channelId && conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot specify both channelId and conversationId',
      });
    }

    // Verify organisation exists and user is member
    const org = await Organisation.findById(organisation);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found',
      });
    }

    const isMember = org.owner.toString() === uploaderId || 
                     org.coWorkers.some(cw => cw.toString() === uploaderId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this organisation',
      });
    }

    // Verify user has access to channel/conversation
    if (channelId) {
      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Channel not found',
        });
      }
      if (channel.organisation.toString() !== organisation) {
        return res.status(403).json({
          success: false,
          message: 'Channel does not belong to this organisation',
        });
      }
      const isCollaborator = channel.collaborators.some(c => c.toString() === uploaderId);
      if (!isCollaborator) {
        return res.status(403).json({
          success: false,
          message: 'Not a collaborator in this channel',
        });
      }
    }

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }
      if (conversation.organisation.toString() !== organisation) {
        return res.status(403).json({
          success: false,
          message: 'Conversation does not belong to this organisation',
        });
      }
      const isCollaborator = conversation.collaborators.some(c => c.toString() === uploaderId);
      if (!isCollaborator) {
        return res.status(403).json({
          success: false,
          message: 'Not a collaborator in this conversation',
        });
      }
    }

    // Check if files were uploaded
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Upload each file to GridFS
    const uploadedFiles = [];
    for (const file of files) {
      const metadata = {
        organisation,
        uploader: uploaderId,
        channel: channelId || null,
        conversation: conversationId || null,
      };

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      const fileId = await uploadStream(
        bufferStream,
        file.originalname,
        file.mimetype,
        metadata
      );

      const fileDoc = await findFileById(fileId);
      
      uploadedFiles.push({
        id: fileId.toString(),
        filename: fileDoc.filename,
        contentType: fileDoc.contentType,
        length: fileDoc.length,
        metadata: fileDoc.metadata,
      });
    }

    res.status(201).json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Error in uploadFiles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get file metadata
 * @route GET /api/files/:id/info
 * @access Private
 */
export const getFileInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find file metadata
    const file = await findFileById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const { organisation, channel, conversation } = file.metadata || {};

    // Verify organisation exists and user is member
    if (!organisation) {
      return res.status(403).json({
        success: false,
        message: 'File access denied',
      });
    }

    const org = await Organisation.findById(organisation);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found',
      });
    }

    const isMember = org.owner.toString() === userId || 
                     org.coWorkers.some(cw => cw.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this organisation',
      });
    }

    // Verify user has access to channel/conversation if specified
    if (channel) {
      const channelDoc = await Channel.findById(channel);
      if (!channelDoc) {
        return res.status(403).json({
          success: false,
          message: 'Channel not found',
        });
      }
      const isCollaborator = channelDoc.collaborators.some(c => c.toString() === userId);
      if (!isCollaborator) {
        return res.status(403).json({
          success: false,
          message: 'Not a collaborator in this channel',
        });
      }
    }

    if (conversation) {
      const conversationDoc = await Conversation.findById(conversation);
      if (!conversationDoc) {
        return res.status(403).json({
          success: false,
          message: 'Conversation not found',
        });
      }
      const isCollaborator = conversationDoc.collaborators.some(c => c.toString() === userId);
      if (!isCollaborator) {
        return res.status(403).json({
          success: false,
          message: 'Not a collaborator in this conversation',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: file._id.toString(),
        filename: file.filename,
        contentType: file.contentType,
        length: file.length,
        metadata: file.metadata,
      },
    });
  } catch (error) {
    console.error('Error in getFileInfo:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
};

/**
 * Stream/download a file
 * @route GET /api/files/:id
 * @access Private
 */
export const streamFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { download } = req.query;
    const userId = req.user.id;

    // Find file metadata
    const file = await findFileById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const { organisation, channel, conversation } = file.metadata || {};

    // Verify organisation exists and user is member
    if (!organisation) {
      return res.status(403).json({
        success: false,
        message: 'File access denied',
      });
    }

    const org = await Organisation.findById(organisation);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found',
      });
    }

    const isMember = org.owner.toString() === userId || 
                     org.coWorkers.some(cw => cw.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this organisation',
      });
    }

    // Verify user has access to channel/conversation if specified
    if (channel) {
      const channelDoc = await Channel.findById(channel);
      if (!channelDoc) {
        return res.status(403).json({
          success: false,
          message: 'Channel not found',
        });
      }
      const isCollaborator = channelDoc.collaborators.some(c => c.toString() === userId);
      if (!isCollaborator) {
        return res.status(403).json({
          success: false,
          message: 'Not a collaborator in this channel',
        });
      }
    }

    if (conversation) {
      const conversationDoc = await Conversation.findById(conversation);
      if (!conversationDoc) {
        return res.status(403).json({
          success: false,
          message: 'Conversation not found',
        });
      }
      const isCollaborator = conversationDoc.collaborators.some(c => c.toString() === userId);
      if (!isCollaborator) {
        return res.status(403).json({
          success: false,
          message: 'Not a collaborator in this conversation',
        });
      }
    }

    // Set content type and disposition
    const { inline } = req.query;
    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    
    if (download === '1') {
      res.setHeader('Content-Disposition', getContentDisposition(file.filename, 'attachment'));
    } else if (inline === '1') {
      // For inline viewing (images, videos)
      res.setHeader('Content-Disposition', getContentDisposition(file.filename, 'inline'));
    } else {
      // For images and videos, default to inline; for others, use attachment
      if (file.contentType && (file.contentType.startsWith('image/') || file.contentType.startsWith('video/'))) {
        res.setHeader('Content-Disposition', getContentDisposition(file.filename, 'inline'));
      } else {
        res.setHeader('Content-Disposition', getContentDisposition(file.filename, 'attachment'));
      }
    }

    res.setHeader('Content-Length', file.length);

    // Stream the file
    const downloadStream = openDownloadStream(file._id);
    
    downloadStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file',
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error in streamFile:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
};

/**
 * Stream/download a file using workspace-based shareable link
 * @route GET /files/:workspaceId/:id/:filename
 * @access Private (requires authentication)
 */
export const streamFileByWorkspace = async (req, res) => {
  try {
    const { workspaceId, id } = req.params;
    const { download } = req.query;
    const userId = req.user.id;

    // Find file metadata
    const file = await findFileById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const { organisation, channel, conversation } = file.metadata || {};

    if (!organisation) {
      return res.status(403).json({
        success: false,
        message: 'File access denied',
      });
    }

    // Ensure file belongs to the requested workspace/organisation
    if (organisation.toString() !== workspaceId) {
      return res.status(403).json({
        success: false,
        message: 'File does not belong to this workspace',
      });
    }

    const org = await Organisation.findById(organisation);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found',
      });
    }

    const isMember = org.owner.toString() === userId ||
      org.coWorkers.some(cw => cw.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this organisation',
      });
    }

    if (channel) {
      const channelDoc = await Channel.findById(channel);
      if (!channelDoc) {
        return res.status(403).json({
          success: false,
          message: 'Channel not found',
        });
      }
      const isCollaborator = channelDoc.collaborators.some(c => c.toString() === userId);
      if (!isCollaborator) {
        return res.status(403).json({
          success: false,
          message: 'Not a collaborator in this channel',
        });
      }
    }

    if (conversation) {
      const conversationDoc = await Conversation.findById(conversation);
      if (!conversationDoc) {
        return res.status(403).json({
          success: false,
          message: 'Conversation not found',
        });
      }
      const isCollaborator = conversationDoc.collaborators.some(c => c.toString() === userId);
      if (!isCollaborator) {
        return res.status(403).json({
          success: false,
          message: 'Not a collaborator in this conversation',
        });
      }
    }

    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');

    if (download === '1') {
      res.setHeader('Content-Disposition', getContentDisposition(file.filename, 'attachment'));
    } else {
      res.setHeader('Content-Disposition', getContentDisposition(file.filename, 'inline'));
    }

    res.setHeader('Content-Length', file.length);

    const downloadStream = openDownloadStream(file._id);

    downloadStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file',
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error in streamFileByWorkspace:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
};

