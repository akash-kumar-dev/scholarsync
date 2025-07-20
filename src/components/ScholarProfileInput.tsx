'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  InputAdornment,
  Link,
  Divider
} from '@mui/material';
import {
  Search,
  Link as LinkIcon,
  CheckCircle,
  Error as ErrorIcon,
  OpenInNew,
  School
} from '@mui/icons-material';

interface ScholarProfileInputProps {
  onProcessed: (data: unknown) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function ScholarProfileInput({ onProcessed, isProcessing, setIsProcessing }: ScholarProfileInputProps) {
  const [profileUrl, setProfileUrl] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const validateUrl = (url: string): boolean => {
    if (url.includes('scholar.google.com/citations?user=')) {
      return true;
    }
    
    if (/^[a-zA-Z0-9_-]+$/.test(url)) {
      return true;
    }
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileUrl.trim()) {
      setError('Please enter a Google Scholar profile URL or user ID');
      return;
    }

    if (!validateUrl(profileUrl.trim())) {
      setError('Please enter a valid Google Scholar profile URL or user ID');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError('');
    setSuccess(false);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch('/api/scholar/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl: profileUrl.trim() }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Google Scholar profile');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process Google Scholar profile');
      }

      setSuccess(true);
      
      setTimeout(() => {
        onProcessed(result.data);
      }, 1000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setProgress(0);
      setSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          fullWidth
          label="Google Scholar Profile URL or User ID"
          placeholder="https://scholar.google.com/citations?user=ABC123 or just ABC123"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          disabled={isProcessing}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon className="text-gray-400" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'rgb(59 130 246)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(59 130 246)',
              },
            },
          }}
        />

        <Typography variant="body2" className="text-gray-500">
          You can enter either the full Google Scholar URL or just the user ID
        </Typography>

        {/* Examples */}
        <Paper elevation={0} className="bg-blue-50 p-4 rounded-lg">
          <Typography variant="subtitle2" className="font-medium text-blue-900 mb-2">
            Examples:
          </Typography>
          <Box className="space-y-1">
            <Typography variant="body2" className="text-blue-800">
              • Full URL: https://scholar.google.com/citations?user=ABC123XYZ
            </Typography>
            <Typography variant="body2" className="text-blue-800">
              • User ID only: ABC123XYZ
            </Typography>
          </Box>
        </Paper>

        {/* Progress Bar */}
        {isProcessing && (
          <Box className="space-y-2">
            <Box className="flex items-center justify-between">
              <Typography variant="body2" className="text-gray-600">
                Fetching profile data...
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
            Profile fetched successfully! Redirecting to results...
          </Alert>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="contained"
          size="large"
          fullWidth
          disabled={isProcessing || success}
          startIcon={isProcessing ? <School className="animate-spin" /> : <Search />}
          className="bg-blue-600 hover:bg-blue-700 py-3 text-lg disabled:bg-gray-400"
        >
          {isProcessing ? 'Fetching Profile...' : 'Analyze Profile'}
        </Button>
      </form>

      {/* Help Section */}
      <Box>
        <Divider className="my-6" />
        <Typography variant="subtitle2" className="font-medium text-gray-900 mb-3">
          Need help finding your Google Scholar profile?
        </Typography>
        <Link
          href="https://scholar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
          underline="none"
        >
          <OpenInNew className="h-4 w-4 mr-1" />
          Go to Google Scholar
        </Link>
        <Typography variant="body2" className="text-gray-600 mt-2">
          Search for your name, click on your profile, and copy the URL from your browser's address bar.
        </Typography>
      </Box>
    </Box>
  );
}