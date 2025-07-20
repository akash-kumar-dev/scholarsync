'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Delete,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

interface ResumeUploaderProps {
  onProcessed: (data: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function ResumeUploader({ onProcessed, isProcessing, setIsProcessing }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or DOCX file');
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setSuccess(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process resume');
      }

      const data = await response.json();
      setSuccess(true);
      
      setTimeout(() => {
        onProcessed(data);
      }, 1000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setProgress(0);
      setSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setProgress(0);
    setSuccess(false);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <Box className="space-y-6">
      {/* File Upload Area */}
      {!file && (
        <Paper
          {...getRootProps()}
          elevation={0}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <Typography variant="h6" className="text-gray-900 mb-2">
            {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
          </Typography>
          <Typography variant="body2" className="text-gray-500 mb-4">
            Drag and drop your resume, or click to browse
          </Typography>
          <Box className="flex justify-center gap-2 mb-2">
            <Chip label="PDF" size="small" variant="outlined" />
            <Chip label="DOCX" size="small" variant="outlined" />
          </Box>
          <Typography variant="caption" className="text-gray-400">
            Maximum file size: 5MB
          </Typography>
        </Paper>
      )}

      {/* Selected File */}
      {file && (
        <Paper elevation={1} className="p-4 bg-gray-50">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center space-x-3">
              <Description className="h-8 w-8 text-blue-600" />
              <Box>
                <Typography variant="subtitle1" className="font-medium text-gray-900">
                  {file.name}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
            </Box>
            {!isProcessing && !success && (
              <IconButton
                onClick={removeFile}
                size="small"
                className="text-gray-500 hover:text-red-500"
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        </Paper>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <Box className="space-y-2">
          <Box className="flex items-center justify-between">
            <Typography variant="body2" className="text-gray-600">
              Processing resume...
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            className="rounded"
            sx={{
              height: 8,
              backgroundColor: 'rgb(229 231 235)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'rgb(59 130 246)'
              }
            }}
          />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          className="rounded-lg"
        >
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert 
          severity="success" 
          icon={<CheckCircle />}
          className="rounded-lg"
        >
          Resume processed successfully! Redirecting to results...
        </Alert>
      )}

      {/* Upload Button */}
      {file && !isProcessing && !success && (
        <Button 
          onClick={handleUpload} 
          variant="contained"
          size="large"
          fullWidth
          startIcon={<CloudUpload />}
          className="bg-blue-600 hover:bg-blue-700 py-3 text-lg"
        >
          Process Resume
        </Button>
      )}
    </Box>
  );
}