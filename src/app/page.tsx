'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Description,
  School,
  TrendingUp,
  Lightbulb,
  Star,
  Analytics,
  AutoAwesome
} from '@mui/icons-material';
import ResumeUploader from '@/components/ResumeUploader';
import ScholarProfileInput from '@/components/ScholarProfileInput';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleResumeProcessed = (data: any) => {
    sessionStorage.setItem('resumeData', JSON.stringify(data));
    router.push('/resume/process');
  };

  const handleScholarProcessed = (data: any) => {
    sessionStorage.setItem('scholarData', JSON.stringify(data));
    router.push('/scholar/process');
  };

  const features = [
    {
      icon: <Description className="h-8 w-8" />,
      title: 'Resume Analysis',
      description: 'Extract skills, experience, and education from PDF/DOCX files',
      color: 'text-blue-600'
    },
    {
      icon: <School className="h-8 w-8" />,
      title: 'Scholar Integration',
      description: 'Analyze Google Scholar profiles for research interests and publications',
      color: 'text-green-600'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Smart Matching',
      description: 'Get AI-powered project suggestions based on your profile',
      color: 'text-purple-600'
    },
    {
      icon: <AutoAwesome className="h-8 w-8" />,
      title: 'Insights & Analytics',
      description: 'Detailed analysis of your academic and professional profile',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Container maxWidth="lg" className="py-8">
        {/* Header Section */}
        <Box className="text-center mb-12 flex flex-col items-center justify-center">
          <Box className="flex items-center justify-center mb-6">
            <Avatar
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'primary.main',
                mr: 2
              }}
            >
              <Analytics className="h-8 w-8" />
            </Avatar>
            <Typography 
              variant="h2" 
              className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              ScholarSync
            </Typography>
          </Box>
          
          <Typography 
            variant="h5" 
            className="text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed text-center"
          >
            Integrate your resume and Google Scholar profile to discover personalized project suggestions
          </Typography>
          
          {/* <Box className="flex justify-center gap-2 mb-8">
            <Chip 
              label="AI-Powered" 
              icon={<Star />} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label="Smart Analysis" 
              icon={<Lightbulb />} 
              color="secondary" 
              variant="outlined" 
            />
            <Chip 
              label="Project Matching" 
              icon={<TrendingUp />} 
              color="primary" 
              variant="outlined" 
            />
          </Box> */}
        </Box>

        {/* Main Upload/Input Section */}
        <Paper 
          elevation={3} 
          className="rounded-2xl overflow-hidden bg-white shadow-xl"
        >
          {/* Tab Header */}
          <Box className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <Typography variant="h4" className="font-bold mb-2 text-center">
              Get Started
            </Typography>
            <Typography variant="body1" className="text-center opacity-90">
              Choose how you'd like to begin your analysis
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            className="border-b bg-gray-50"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                fontWeight: 600,
                py: 3,
                minHeight: 80
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: 2
              }
            }}
          >
            <Tab 
              label="Upload Resume" 
              icon={<Description className="h-6 w-6" />} 
              iconPosition="start"
              className="text-gray-700"
            />
            <Tab 
              label="Scholar Profile" 
              icon={<School className="h-6 w-6" />} 
              iconPosition="start"
              className="text-gray-700"
            />
          </Tabs>

          {/* Tab Content */}
          <Box className="p-8">
            <TabPanel value={tabValue} index={0}>
              <Box className="max-w-2xl mx-auto">
                <Box className="text-center mb-8">
                  <Description className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <Typography variant="h5" className="font-semibold mb-2 text-gray-900">
                    Upload Your Resume
                  </Typography>
                  <Typography variant="body1" className="text-gray-600 mb-6">
                    Upload your resume in PDF or DOCX format to extract skills, experience, and education details
                  </Typography>
                  <Box className="flex justify-center gap-4 text-sm text-gray-500">
                    <span>✓ PDF & DOCX Support</span>
                    <span>✓ Secure Processing</span>
                    <span>✓ Instant Analysis</span>
                  </Box>
                </Box>
                
                <ResumeUploader
                  onProcessed={handleResumeProcessed}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box className="max-w-2xl mx-auto">
                <Box className="text-center mb-8">
                  <School className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <Typography variant="h5" className="font-semibold mb-2 text-gray-900">
                    Connect Scholar Profile
                  </Typography>
                  <Typography variant="body1" className="text-gray-600 mb-6">
                    Enter your Google Scholar profile URL to analyze your research interests, publications, and citations
                  </Typography>
                  <Box className="flex justify-center gap-4 text-sm text-gray-500">
                    <span>✓ Publication Analysis</span>
                    <span>✓ Citation Metrics</span>
                    <span>✓ Research Insights</span>
                  </Box>
                </Box>
                
                <ScholarProfileInput
                  onProcessed={handleScholarProcessed}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </Box>
            </TabPanel>
          </Box>
        </Paper>

        {/* Features Grid */}
        <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-16 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index}
              elevation={0} 
              className="h-full border hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="text-center p-6">
                <Box className={`${feature.color} mb-4 flex justify-center`}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  {feature.title}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </div>
  );
}
