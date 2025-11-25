import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { File } from './File';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = 'uploads/tests';
const TEST_UPLOAD_DIR = `./${UPLOAD_DIR}`;
const ORIGINAL_ENV = process.env.FILE_STORAGE_LOCAL_PATH;

describe('File Utility Class', () => {
  beforeAll(async () => {
    // Set test upload directory
    process.env.FILE_STORAGE_LOCAL_PATH = TEST_UPLOAD_DIR;

    // Clean up test directory if it exists
    try {
      await fs.promises.rm(TEST_UPLOAD_DIR, { recursive: true, force: true });
    } catch {
      // Ignore errors if directory doesn't exist
    }
  });

  afterAll(async () => {
    // Restore original environment
    if (ORIGINAL_ENV) {
      process.env.FILE_STORAGE_LOCAL_PATH = ORIGINAL_ENV;
    } else {
      delete process.env.FILE_STORAGE_LOCAL_PATH;
    }

    // Clean up test directory
    try {
      await fs.promises.rm(TEST_UPLOAD_DIR, { recursive: true, force: true });
    } catch {
      // Ignore errors if directory doesn't exist
    }
  });

  describe('buildPath', () => {
    it('should build a path within the upload directory', () => {
      const relativePath = 'documents/test.pdf';
      const result = File.buildPath(relativePath);
      expect(result).toBe(path.join(TEST_UPLOAD_DIR, relativePath));
    });

    it('should handle paths with leading slash', () => {
      const relativePath = '/documents/test.pdf';
      const result = File.buildPath(relativePath);
      expect(result).toContain('documents/test.pdf');
    });
  });

  describe('getDateFolder', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const result = File.getDateFolder();
      const today = new Date().toISOString().slice(0, 10);
      expect(result).toBe(today);
    });

    it('should return specific date in YYYY-MM-DD format', () => {
      const testDate = new Date('2025-11-25T10:00:00Z');
      const result = File.getDateFolder(testDate);
      expect(result).toBe('2025-11-25');
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate a unique filename with timestamp', () => {
      const original = 'document.pdf';
      const result = File.generateUniqueFilename(original);

      expect(result).toContain('document.pdf');
      expect(result).toMatch(/^\d+-document\.pdf$/);
    });

    it('should handle filenames with paths', () => {
      const original = 'path/to/document.pdf';
      const result = File.generateUniqueFilename(original);

      expect(result).toContain('document.pdf');
      expect(result).not.toContain('path/to/');
    });

    it('should generate different filenames for consecutive calls', async () => {
      const original = 'test.txt';
      const first = File.generateUniqueFilename(original);

      // Wait a tiny bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));

      const second = File.generateUniqueFilename(original);
      expect(first).not.toBe(second);
    });
  });

  describe('save', () => {
    it('should save a file from base64 content', async () => {
      const content = 'Hello, World!';
      const base64Content = Buffer.from(content).toString('base64');
      const filename = 'test.txt';

      const result = await File.save(base64Content, filename);

      expect(result.filename).toContain('test.txt');
      expect(result.path).toContain(UPLOAD_DIR);
      expect(result.size).toBeGreaterThan(0);

      // Verify file exists and content is correct
      const savedContent = await fs.promises.readFile(result.path, 'utf8');
      expect(savedContent).toBe(content);
    });

    it('should save a file from Buffer content', async () => {
      const content = 'Buffer content test';
      const buffer = Buffer.from(content);
      const filename = 'buffer-test.txt';

      const result = await File.save(buffer, filename, { encoding: 'utf8' });

      expect(result.filename).toContain('buffer-test.txt');
      expect(result.size).toBe(buffer.length);

      // Verify content
      const savedContent = await fs.promises.readFile(result.path, 'utf8');
      expect(savedContent).toBe(content);
    });

    it('should save file in date-based subfolder by default', async () => {
      const content = Buffer.from('Test content');
      const filename = 'dated-file.txt';

      const result = await File.save(content, filename, { encoding: 'utf8' });

      const today = new Date().toISOString().slice(0, 10);
      expect(result.path).toContain(today);
    });

    it('should save file in custom subfolder', async () => {
      const content = Buffer.from('Custom folder test');
      const filename = 'custom.txt';
      const subfolder = 'custom-folder';

      const result = await File.save(content, filename, {
        subfolder,
        encoding: 'utf8',
      });

      expect(result.path).toContain(subfolder);
      expect(result.path).not.toContain(File.getDateFolder());
    });

    it('should save file without timestamp when useTimestamp is false', async () => {
      const content = Buffer.from('No timestamp');
      const filename = 'exact-name.txt';

      const result = await File.save(content, filename, {
        useTimestamp: false,
        encoding: 'utf8',
      });

      expect(result.filename).toBe('exact-name.txt');
      expect(result.filename).not.toMatch(/^\d+-/);
    });

    it('should create nested directories if they do not exist', async () => {
      const content = Buffer.from('Nested test');
      const filename = 'nested.txt';
      const subfolder = 'level1/level2/level3';

      const result = await File.save(content, filename, {
        subfolder,
        encoding: 'utf8',
      });

      expect(result.path).toContain('level1/level2/level3');

      // Verify file exists
      const exists = await File.exists(result.path);
      expect(exists).toBe(true);
    });
  });

  describe('read', () => {
    it('should read a file as Buffer by default', async () => {
      const content = 'Read test content';
      const { path: filePath } = await File.save(
        Buffer.from(content),
        'read-test.txt',
        { encoding: 'utf8' },
      );

      const result = await File.read(filePath);

      expect(result).toBeInstanceOf(Buffer);
      expect((result as Buffer).toString('utf8')).toBe(content);
    });

    it('should read a file as string with encoding', async () => {
      const content = 'Encoded read test';
      const { path: filePath } = await File.save(
        Buffer.from(content),
        'encoded-read.txt',
        { encoding: 'utf8' },
      );

      const result = await File.read(filePath, { encoding: 'utf8' });

      expect(typeof result).toBe('string');
      expect(result).toBe(content);
    });

    it('should read a file as base64', async () => {
      const content = 'Base64 test content';
      const expectedBase64 = Buffer.from(content).toString('base64');

      const { path: filePath } = await File.save(
        Buffer.from(content),
        'base64-read.txt',
        { encoding: 'utf8' },
      );

      const result = await File.read(filePath, { asBase64: true });

      expect(typeof result).toBe('string');
      expect(result).toBe(expectedBase64);
    });

    it('should read file using relative path', async () => {
      const content = 'Relative path test';
      const subfolder = 'relative-test';

      const { filename } = await File.save(
        Buffer.from(content),
        'relative.txt',
        { subfolder, encoding: 'utf8', useTimestamp: false },
      );

      const relativePath = path.join(subfolder, filename);
      const result = await File.read(relativePath, { encoding: 'utf8' });

      expect(result).toBe(content);
    });

    it('should throw error when file does not exist', async () => {
      const nonExistentPath = 'non-existent/file.txt';

      await expect(File.read(nonExistentPath)).rejects.toThrow('File not found or not readable');
    });
  });

  describe('delete', () => {
    it('should delete an existing file', async () => {
      const content = Buffer.from('Delete test');
      const { path: filePath } = await File.save(content, 'delete-test.txt', {
        encoding: 'utf8',
      });

      // Verify file exists
      let exists = await File.exists(filePath);
      expect(exists).toBe(true);

      // Delete file
      const result = await File.delete(filePath);
      expect(result).toBe(true);

      // Verify file no longer exists
      exists = await File.exists(filePath);
      expect(exists).toBe(false);
    });

    it('should return false when deleting non-existent file', async () => {
      const result = await File.delete('non-existent-file.txt');
      expect(result).toBe(false);
    });

    it('should delete file using relative path', async () => {
      const subfolder = 'delete-relative';
      const { filename } = await File.save(
        Buffer.from('Delete relative'),
        'delete-rel.txt',
        { subfolder, encoding: 'utf8', useTimestamp: false },
      );

      const relativePath = path.join(subfolder, filename);
      const result = await File.delete(relativePath);

      expect(result).toBe(true);
    });
  });

  describe('exists', () => {
    it('should return true for existing file', async () => {
      const { path: filePath } = await File.save(
        Buffer.from('Exists test'),
        'exists-test.txt',
        { encoding: 'utf8' },
      );

      const result = await File.exists(filePath);
      expect(result).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const result = await File.exists('non-existent-file.txt');
      expect(result).toBe(false);
    });

    it('should work with relative paths', async () => {
      const subfolder = 'exists-relative';
      const { filename } = await File.save(
        Buffer.from('Exists relative'),
        'exists-rel.txt',
        { subfolder, encoding: 'utf8', useTimestamp: false },
      );

      const relativePath = path.join(subfolder, filename);
      const result = await File.exists(relativePath);

      expect(result).toBe(true);
    });
  });

  describe('getMetadata', () => {
    it('should return file metadata', async () => {
      const content = 'Metadata test content';
      const { path: filePath } = await File.save(
        Buffer.from(content),
        'metadata-test.txt',
        { encoding: 'utf8' },
      );

      const metadata = await File.getMetadata(filePath);

      expect(metadata.size).toBe(content.length);
      expect(metadata.created).toBeInstanceOf(Date);
      expect(metadata.modified).toBeInstanceOf(Date);
      expect(metadata.isFile).toBe(true);
      expect(metadata.isDirectory).toBe(false);
    });

    it('should work with relative paths', async () => {
      const subfolder = 'metadata-relative';
      const content = 'Metadata relative test';

      const { filename } = await File.save(
        Buffer.from(content),
        'metadata-rel.txt',
        { subfolder, encoding: 'utf8', useTimestamp: false },
      );

      const relativePath = path.join(subfolder, filename);
      const metadata = await File.getMetadata(relativePath);

      expect(metadata.size).toBe(content.length);
      expect(metadata.isFile).toBe(true);
    });

    it('should throw error for non-existent file', async () => {
      await expect(File.getMetadata('non-existent.txt')).rejects.toThrow();
    });
  });

  describe('Integration: save and read workflow', () => {
    it('should save and read a file successfully', async () => {
      const originalContent = 'Integration test: save and read';
      const filename = 'integration-test.txt';

      // Save file
      const saveResult = await File.save(
        Buffer.from(originalContent),
        filename,
        { encoding: 'utf8' },
      );

      expect(saveResult.size).toBe(originalContent.length);

      // Read file
      const readContent = await File.read(saveResult.path, { encoding: 'utf8' });

      expect(readContent).toBe(originalContent);
    });

    it('should handle binary files (images)', async () => {
      // Create a simple binary content (simulating an image)
      const binaryContent = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const filename = 'test-image.jpg';

      // Save binary file
      const saveResult = await File.save(binaryContent, filename, {
        encoding: 'binary',
      });

      // Read as buffer
      const readBuffer = await File.read(saveResult.path);

      expect(readBuffer).toBeInstanceOf(Buffer);
      expect(Buffer.compare(readBuffer as Buffer, binaryContent)).toBe(0);
    });

    it('should handle base64 round-trip', async () => {
      const originalContent = 'Base64 round-trip test';
      const base64Content = Buffer.from(originalContent).toString('base64');

      // Save from base64
      const saveResult = await File.save(base64Content, 'base64-roundtrip.txt');

      // Read as base64
      const readBase64 = await File.read(saveResult.path, { asBase64: true });

      expect(readBase64).toBe(base64Content);

      // Verify original content
      const decodedContent = Buffer.from(readBase64 as string, 'base64').toString('utf8');
      expect(decodedContent).toBe(originalContent);
    });
  });
});
