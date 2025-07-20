'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  Chip,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Divider,
  Link
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  GitHub,
  LinkedIn,
  Language,
  School,
  Work,
  Code,
  ArrowBack,
  FilePresent,
  Lightbulb
} from '@mui/icons-material';
import ProjectSuggestions from '@/components/ProjectSuggestions';

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

export default function ResumeProcessPage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const data = sessionStorage.getItem('resumeData');
    if (data) {
      setResumeData(JSON.parse(data));
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Box className="text-center">
          <CircularProgress size={60} />
          <Typography variant="h6" className="mt-4 text-gray-600">
            Loading resume data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!resumeData) {
    return null;
  }

  const { personalInfo, education, experience, skills, metadata } = resumeData as {
    personalInfo?: { name?: string; email?: string; phone?: string; github?: string; linkedin?: string; website?: string };
    education?: Array<{ degree?: string; institution?: string; startDate?: string; endDate?: string; gpa?: string }>;
    experience?: Array<{ position?: string; company?: string; startDate?: string; endDate?: string; description?: string[] }>;
    skills?: string[];
    metadata?: { fileName?: string; processingTime?: number };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container maxWidth="lg" className="py-8">
        {/* Header */}
        <Box className="mb-8">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/')}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            Back to Home
          </Button>
          
          <Paper elevation={2} className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography variant="h3" className="font-bold mb-2">
                  Resume Analysis Complete
                </Typography>
                <Typography variant="h6" className="opacity-90">
                  Processing completed in {metadata?.processingTime}ms
                </Typography>
              </Box>
              <Box className="flex items-center space-x-2">
                <FilePresent className="h-8 w-8" />
                <Typography variant="h6" className="font-medium">
                  {metadata?.fileName}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Paper elevation={1} className="rounded-xl overflow-hidden">
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            className="border-b"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 500,
                py: 2
              }
            }}
          >
            <Tab label="Overview" icon={<Person />} iconPosition="start" />
            <Tab label="Experience" icon={<Work />} iconPosition="start" />
            <Tab label="Education" icon={<School />} iconPosition="start" />
            <Tab label="Project Suggestions" icon={<Lightbulb />} iconPosition="start" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box className="p-6 space-y-6">
              {/* Personal Information */}
              <Card elevation={0} className="border">
                <CardContent>
                  <Typography variant="h5" className="font-semibold mb-4 flex items-center">
                    <Person className="mr-2" />
                    Personal Information
                  </Typography>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box className="space-y-3">
                        {personalInfo?.name && (
                          <Box className="flex items-center space-x-2">
                            <Person className="h-5 w-5 text-gray-500" />
                            <Typography variant="body1" className="font-medium">
                              {personalInfo.name}
                            </Typography>
                          </Box>
                        )}
                        {personalInfo?.email && (
                          <Box className="flex items-center space-x-2">
                            <Email className="h-5 w-5 text-gray-500" />
                            <Typography variant="body1">
                              {personalInfo.email}
                            </Typography>
                          </Box>
                        )}
                        {personalInfo?.phone && (
                          <Box className="flex items-center space-x-2">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <Typography variant="body1">
                              {personalInfo.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box className="space-y-3">
                        {personalInfo?.github && (
                          <Box className="flex items-center space-x-2">
                            <GitHub className="h-5 w-5 text-gray-500" />
                            <Link 
                              href={personalInfo.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              GitHub Profile
                            </Link>
                          </Box>
                        )}
                        {personalInfo?.linkedin && (
                          <Box className="flex items-center space-x-2">
                            <LinkedIn className="h-5 w-5 text-gray-500" />
                            <Link 
                              href={personalInfo.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              LinkedIn Profile
                            </Link>
                          </Box>
                        )}
                        {personalInfo?.website && (
                          <Box className="flex items-center space-x-2">
                            <Language className="h-5 w-5 text-gray-500" />
                            <Link 
                              href={personalInfo.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Personal Website
                            </Link>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card elevation={0} className="border">
                <CardContent>
                  <Typography variant="h5" className="font-semibold mb-4 flex items-center">
                    <Code className="mr-2" />
                    Technical Skills ({skills?.length || 0} skills extracted)
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {skills?.map((skill: string, index: number) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        variant="outlined"
                        className="m-1"
                        sx={{ 
                          borderColor: 'rgb(59 130 246)',
                          color: 'rgb(59 130 246)',
                          '&:hover': {
                            backgroundColor: 'rgb(239 246 255)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box className="p-6 text-center">
              <Button
                variant="contained"
                size="large"
                startIcon={<Lightbulb />}
                onClick={() => setTabValue(3)}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
              >
                View Project Suggestions
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box className="p-6">
              <Card elevation={0} className="border">
                <CardContent>
                  <Typography variant="h5" className="font-semibold mb-6 flex items-center">
                    <Work className="mr-2" />
                    Work Experience
                  </Typography>
                  <Box className="space-y-6">
                    {experience?.map((exp, index) => (
                      <Box key={index} className="border-l-4 border-blue-200 pl-6">
                        <Typography variant="h6" className="font-semibold">
                          {exp.position}
                        </Typography>
                        <Typography variant="subtitle1" className="text-blue-600 font-medium">
                          {exp.company}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500 mb-3">
                          {exp.startDate} - {exp.endDate}
                        </Typography>
                        {exp.description && (
                          <Box component="ul" className="list-disc list-inside space-y-1">
                            {exp.description.map((desc, i) => (
                              <Typography key={i} component="li" variant="body2" className="text-gray-600">
                                {desc}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        {index < (experience?.length || 0) - 1 && <Divider className="mt-6" />}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box className="p-6">
              <Card elevation={0} className="border">
                <CardContent>
                  <Typography variant="h5" className="font-semibold mb-6 flex items-center">
                    <School className="mr-2" />
                    Education
                  </Typography>
                  <Box className="space-y-6">
                    {education?.map((edu, index) => (
                      <Box key={index} className="border-l-4 border-green-200 pl-6">
                        <Typography variant="h6" className="font-semibold">
                          {edu.degree}
                        </Typography>
                        <Typography variant="subtitle1" className="text-green-600 font-medium">
                          {edu.institution}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500 mb-2">
                          {edu.startDate} - {edu.endDate}
                        </Typography>
                        {edu.gpa && (
                          <Typography variant="body2" className="text-gray-600">
                            CGPA: {edu.gpa}
                          </Typography>
                        )}
                        {index < (education?.length || 0) - 1 && <Divider className="mt-6" />}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box className="p-6">
              {skills && skills.length > 0 ? (
                <ProjectSuggestions userSkills={skills} />
              ) : (
                <Card elevation={0} className="border">
                  <CardContent className="text-center py-16">
                    <Box className="max-w-md mx-auto">
                      <Box className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lightbulb className="h-10 w-10 text-yellow-600" />
                      </Box>
                      <Typography variant="h4" className="font-bold text-gray-900 mb-4">
                        No Skills Extracted
                      </Typography>
                      <Typography variant="body1" className="text-gray-600 mb-6">
                        We couldn't extract enough technical skills from your resume to generate project suggestions.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => setTabValue(0)}
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Back to Overview
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </div>
  );
}