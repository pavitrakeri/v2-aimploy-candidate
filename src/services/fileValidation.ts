// File Validation Service for BGV Document Uploads

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileType: string;
  fileSize: number;
  fileName: string;
  contentAnalysis?: {
    isExpectedContent: boolean;
    confidence: number;
    analysis: string;
    detectedContent: string[];
  };
}

export interface DocumentTypeConfig {
  id: string;
  label: string;
  allowedTypes: string[];
  maxSize: number;
  required: boolean;
  namePatterns: RegExp[];
  expectedContent: string[];
  aiValidation: boolean;
}

export const DOCUMENT_TYPE_CONFIGS: Record<string, DocumentTypeConfig> = {
  identity: {
    id: 'identity',
    label: 'Identity Document',
    allowedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    required: true,
    namePatterns: [
      /aadhaar/i,
      /pan/i,
      /passport/i,
      /voter/i,
      /driving.*license/i,
      /id/i,
      /identity/i
    ],
    expectedContent: [
      'identification document',
      'government issued id',
      'photo id',
      'personal identification'
    ],
    aiValidation: true
  },
  address_proof: {
    id: 'address_proof',
    label: 'Address Proof',
    allowedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    required: false,
    namePatterns: [
      /address/i,
      /utility/i,
      /bank/i,
      /rent/i,
      /lease/i,
      /electricity/i,
      /water/i,
      /gas/i
    ],
    expectedContent: [
      'address proof',
      'utility bill',
      'bank statement',
      'rent agreement',
      'residential proof'
    ],
    aiValidation: true
  },
  education_certificate: {
    id: 'education_certificate',
    label: 'Education Certificate',
    allowedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    required: false,
    namePatterns: [
      /certificate/i,
      /degree/i,
      /diploma/i,
      /marksheet/i,
      /transcript/i,
      /graduation/i,
      /education/i
    ],
    expectedContent: [
      'educational certificate',
      'degree certificate',
      'academic transcript',
      'mark sheet',
      'diploma'
    ],
    aiValidation: true
  },
  experience_letter: {
    id: 'experience_letter',
    label: 'Experience Letter',
    allowedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    required: false,
    namePatterns: [
      /experience/i,
      /employment/i,
      /work/i,
      /job/i,
      /service/i,
      /offer/i,
      /relieving/i
    ],
    expectedContent: [
      'experience certificate',
      'employment verification',
      'work experience',
      'job letter',
      'service certificate'
    ],
    aiValidation: true
  },
  salary_slip: {
    id: 'salary_slip',
    label: 'Salary Slip',
    allowedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    required: false,
    namePatterns: [
      /salary/i,
      /payslip/i,
      /pay.*slip/i,
      /income/i,
      /earnings/i
    ],
    expectedContent: [
      'salary slip',
      'payslip',
      'income statement',
      'earnings statement',
      'pay slip'
    ],
    aiValidation: true
  }
};

class FileValidationService {
  private uploadedFiles: Map<string, File> = new Map();

  // Generate file hash for duplicate detection
  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // Check for duplicate files
  private async isDuplicateFile(file: File, documentType: string): Promise<boolean> {
    const fileHash = await this.generateFileHash(file);
    const key = `${documentType}_${fileHash}`;
    
    if (this.uploadedFiles.has(key)) {
      return true;
    }
    
    // Check if same file was uploaded for different document type
    for (const [existingKey] of this.uploadedFiles) {
      if (existingKey.endsWith(`_${fileHash}`)) {
        return true;
      }
    }
    
    return false;
  }

  // Validate file type
  private validateFileType(file: File, config: DocumentTypeConfig): string[] {
    const errors: string[] = [];
    
    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!config.allowedTypes.includes(fileExtension)) {
      errors.push(`Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`);
    }
    
    // Check MIME type
    const allowedMimeTypes = this.getMimeTypes(config.allowedTypes);
    if (!allowedMimeTypes.includes(file.type) && file.type !== '') {
      errors.push(`Invalid file format. Expected: ${config.allowedTypes.join(', ')}`);
    }
    
    return errors;
  }

  // Get MIME types for allowed extensions
  private getMimeTypes(extensions: string[]): string[] {
    const mimeMap: Record<string, string[]> = {
      '.pdf': ['application/pdf'],
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png']
    };
    
    const mimeTypes: string[] = [];
    extensions.forEach(ext => {
      if (mimeMap[ext]) {
        mimeTypes.push(...mimeMap[ext]);
      }
    });
    return mimeTypes;
  }

  // Validate file size
  private validateFileSize(file: File, config: DocumentTypeConfig): string[] {
    const errors: string[] = [];
    
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
      errors.push(`File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
    }
    
    if (file.size === 0) {
      errors.push('File is empty');
    }
    
    return errors;
  }

  // Validate file name patterns
  private validateFileName(file: File, config: DocumentTypeConfig): { errors: string[], warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileName = file.name.toLowerCase();
    
    // Check if any pattern matches
    const hasMatchingPattern = config.namePatterns.some(pattern => pattern.test(fileName));
    
    if (!hasMatchingPattern && config.namePatterns.length > 0) {
      warnings.push('File name does not match expected patterns. Consider renaming to include terms like: ' + 
        config.namePatterns.map(pattern => pattern.source).join(', '));
    }
    
    // Check for special characters
    if (!/^[a-zA-Z0-9._\-\s]+$/.test(fileName)) {
      warnings.push('File name contains special characters. Consider using only letters, numbers, dots, hyphens, and underscores.');
    }
    
    // Check file name length
    if (fileName.length > 100) {
      warnings.push('File name is very long. Consider shortening it.');
    }
    
    return { errors, warnings };
  }

  // Perform AI content analysis (mock implementation - would call actual AI service)
  private async analyzeContent(file: File, config: DocumentTypeConfig): Promise<{
    isExpectedContent: boolean;
    confidence: number;
    analysis: string;
    detectedContent: string[];
  }> {
    // This is a mock implementation. In production, this would call your AI service
    // For now, we'll simulate AI analysis based on file name and type
    
    const fileName = file.name.toLowerCase();
    const detectedContent: string[] = [];
    let confidence = 0.5;
    let isExpectedContent = false;
    
    // Simulate content detection based on file name
    config.expectedContent.forEach(content => {
      if (fileName.includes(content.toLowerCase().split(' ')[0])) {
        detectedContent.push(content);
        confidence += 0.2;
      }
    });
    
    // Simulate content detection based on file name patterns
    config.namePatterns.forEach(pattern => {
      if (pattern.test(fileName)) {
        detectedContent.push(`Detected: ${pattern.source}`);
        confidence += 0.15;
      }
    });
    
    // Cap confidence at 0.95
    confidence = Math.min(confidence, 0.95);
    isExpectedContent = confidence > 0.6;
    
    const analysis = isExpectedContent 
      ? `File appears to contain ${config.label.toLowerCase()} content with ${(confidence * 100).toFixed(0)}% confidence.`
      : `File content could not be verified as ${config.label.toLowerCase()}. Please ensure this is the correct document.`;
    
    return {
      isExpectedContent,
      confidence,
      analysis,
      detectedContent
    };
  }

  // Main validation function
  async validateFile(file: File, documentType: string): Promise<ValidationResult> {
    console.log(`Validating file: ${file.name} for type: ${documentType}`);
    
    const config = DOCUMENT_TYPE_CONFIGS[documentType];
    if (!config) {
      console.log('Invalid document type:', documentType);
      return {
        isValid: false,
        errors: ['Invalid document type'],
        warnings: [],
        fileType: file.type,
        fileSize: file.size,
        fileName: file.name
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. File type validation
    console.log('Step 1: Validating file type...');
    const fileTypeErrors = this.validateFileType(file, config);
    console.log('File type errors:', fileTypeErrors);
    errors.push(...fileTypeErrors);

    // 2. File size validation
    console.log('Step 2: Validating file size...');
    const fileSizeErrors = this.validateFileSize(file, config);
    console.log('File size errors:', fileSizeErrors);
    errors.push(...fileSizeErrors);

    // 3. Duplicate file detection
    console.log('Step 3: Checking for duplicates...');
    const isDuplicate = await this.isDuplicateFile(file, documentType);
    console.log('Is duplicate:', isDuplicate);
    if (isDuplicate) {
      errors.push('This file has already been uploaded. Please choose a different file.');
    }

    // 4. File name validation
    console.log('Step 4: Validating file name...');
    const nameValidation = this.validateFileName(file, config);
    console.log('Name validation:', nameValidation);
    errors.push(...nameValidation.errors);
    warnings.push(...nameValidation.warnings);

    // 5. Content analysis (if AI validation is enabled)
    let contentAnalysis;
    if (config.aiValidation && errors.length === 0) {
      console.log('Step 5: Performing AI content analysis...');
      contentAnalysis = await this.analyzeContent(file, config);
      console.log('Content analysis:', contentAnalysis);
    }

    const isValid = errors.length === 0;
    console.log('Final validation result:', { isValid, errors, warnings });

    return {
      isValid,
      errors,
      warnings,
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name,
      contentAnalysis
    };
  }

  // Register uploaded file for duplicate detection
  async registerUploadedFile(file: File, documentType: string): Promise<void> {
    const fileHash = await this.generateFileHash(file);
    const key = `${documentType}_${fileHash}`;
    this.uploadedFiles.set(key, file);
  }

  // Remove file from registry
  removeUploadedFile(file: File, documentType: string): void {
    // This would need the hash to remove, for now we'll clear by document type
    const keysToRemove: string[] = [];
    for (const [key] of this.uploadedFiles) {
      if (key.startsWith(documentType + '_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => this.uploadedFiles.delete(key));
  }

  // Get file validation rules for UI display
  getValidationRules(documentType: string): DocumentTypeConfig | null {
    return DOCUMENT_TYPE_CONFIGS[documentType] || null;
  }

  // Clear all uploaded files (for testing or reset)
  clearUploadedFiles(): void {
    this.uploadedFiles.clear();
  }
}

export const fileValidationService = new FileValidationService();
