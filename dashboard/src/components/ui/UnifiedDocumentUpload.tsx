import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileUploader, FileUploaderContent, FileUploaderItem, FileInput } from '@/userDefinedComponents/FileUploader';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSize: number;
}

interface DocumentUploadState {
  [key: string]: File[] | null;
}

interface UnifiedDocumentUploadProps {
  documents: DocumentUploadState;
  onDocumentsChange: (documents: DocumentUploadState) => void;
  className?: string;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'businessRegistration',
    name: 'Business Registration Certificate',
    description: 'Upload your business registration certificate or license',
    required: true,
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  {
    id: 'taxRegistration',
    name: 'Tax Registration Certificate',
    description: 'Upload your tax registration certificate (ABN, GST, etc.)',
    required: true,
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024,
  },
  {
    id: 'idVerification',
    name: 'ID Verification',
    description: 'Upload a valid government-issued ID of the business owner',
    required: true,
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024,
  },
  {
    id: 'bankStatement',
    name: 'Bank Statement',
    description: 'Upload a recent bank statement (within the last 3 months)',
    required: true,
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024,
  },
  {
    id: 'businessInsurance',
    name: 'Business Insurance',
    description: 'Upload your business insurance certificate (optional)',
    required: false,
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024,
  },
  {
    id: 'businessLicense',
    name: 'Business License',
    description: 'Upload any additional business licenses (optional)',
    required: false,
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024,
  },
];

export function UnifiedDocumentUpload({ documents, onDocumentsChange, className }: UnifiedDocumentUploadProps) {
  const [activeUpload, setActiveUpload] = useState<string | null>(null);

  const handleDocumentChange = (documentId: string, files: File[] | null) => {
    onDocumentsChange({
      ...documents,
      [documentId]: files,
    });
  };

  const removeDocument = (documentId: string) => {
    handleDocumentChange(documentId, null);
  };

  const getUploadedCount = () => {
    return Object.values(documents).filter(files => files && files.length > 0).length;
  };

  const getRequiredCount = () => {
    return DOCUMENT_TYPES.filter(doc => doc.required).length;
  };

  const getCompletionPercentage = () => {
    const uploaded = getUploadedCount();
    const total = DOCUMENT_TYPES.length;
    return Math.round((uploaded / total) * 100);
  };

  const isDocumentUploaded = (documentId: string) => {
    return documents[documentId] && documents[documentId]!.length > 0;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Document Upload Progress</CardTitle>
              <CardDescription>
                {getUploadedCount()} of {DOCUMENT_TYPES.length} documents uploaded
                ({getRequiredCount()} required)
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{getCompletionPercentage()}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </CardContent>
      </Card>

      {/* Document Upload Grid */}
      <div className="grid gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const isUploaded = isDocumentUploaded(docType.id);
          const files = documents[docType.id];

          return (
            <Card 
              key={docType.id} 
              className={cn(
                "transition-all duration-200",
                isUploaded && "border-green-200 bg-green-50/50",
                activeUpload === docType.id && "ring-2 ring-primary/20"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{docType.name}</CardTitle>
                      {docType.required ? (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      )}
                      {isUploaded && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {docType.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Formats: {docType.acceptedFormats.join(', ')}</span>
                      <span>Max: {formatFileSize(docType.maxSize)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!isUploaded ? (
                  <FileUploader
                    value={files}
                    onValueChange={(newFiles) => handleDocumentChange(docType.id, newFiles)}
                    dropzoneOptions={{
                      accept: {
                        'application/pdf': ['.pdf'],
                        'image/jpeg': ['.jpg', '.jpeg'],
                        'image/png': ['.png']
                      },
                      maxFiles: 1,
                      maxSize: docType.maxSize,
                      onDropAccepted: () => setActiveUpload(docType.id),
                      onDropRejected: () => setActiveUpload(null),
                    }}
                    className="w-full"
                  >
                    <FileInput 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-primary/50 transition-colors"
                      onFocus={() => setActiveUpload(docType.id)}
                      onBlur={() => setActiveUpload(null)}
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {docType.acceptedFormats.join(', ').toUpperCase()} up to {formatFileSize(docType.maxSize)}
                        </p>
                      </div>
                    </FileInput>
                  </FileUploader>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {files![0].name}
                        </p>
                        <p className="text-xs text-green-600">
                          {formatFileSize(files![0].size)} • Uploaded successfully
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(docType.id)}
                      className="text-green-600 hover:text-green-800 hover:bg-green-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {getUploadedCount() >= getRequiredCount() ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">All required documents uploaded!</p>
                  <p className="text-sm text-green-600">
                    You can proceed with your application or upload additional optional documents.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    {getRequiredCount() - getUploadedCount()} required documents remaining
                  </p>
                  <p className="text-sm text-amber-600">
                    Please upload all required documents to complete your application.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
