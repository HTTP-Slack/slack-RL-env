export interface FileMetadata {
  id: string;
  filename: string;
  contentType: string;
  length: number;
  metadata: {
    organisation: string;
    uploader: string;
    channel?: string;
    conversation?: string;
  };
}

