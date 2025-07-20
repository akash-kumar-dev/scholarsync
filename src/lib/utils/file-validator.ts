export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const SUPPORTED_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): FileValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  const supportedTypes = Object.values(SUPPORTED_TYPES);
  if (!supportedTypes.includes(file.type as any)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Please upload a PDF or DOCX file.' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` 
    };
  }

  if (!file.name || file.name.trim() === '') {
    return { isValid: false, error: 'Invalid file name' };
  }

  return { isValid: true };
}

export function getFileType(mimeType: string): 'pdf' | 'docx' | 'unknown' {
  switch (mimeType) {
    case SUPPORTED_TYPES.PDF:
      return 'pdf';
    case SUPPORTED_TYPES.DOCX:
      return 'docx';
    default:
      return 'unknown';
  }
}