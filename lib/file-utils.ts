// lib/file-utils.ts
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// For local development, we'll save files to a uploads directory in the public folder
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure the upload directory exists
export async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw error;
  }
}

// Save a file to the upload directory
export async function saveFileToLocal(file: File): Promise<{ fileName: string; fileType: string; fileSize: number; fileUrl: string }> {
  try {
    await ensureUploadDir();
    
    // Generate a unique filename
    const uniqueFileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFileName);
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write the file
    await writeFile(filePath, buffer);
    
    // Return file information
    return {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: `/uploads/${uniqueFileName}` // URL path (accessible via public directory)
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

// For production, you might want to add implementations for cloud storage:
/*
export async function saveFileToS3(file: File) {
  // Implementation for AWS S3
  // You'll need the AWS SDK and appropriate credentials
}

export async function saveFileToCloudStorage(file: File) {
  // Implementation for Google Cloud Storage or other providers
}
*/