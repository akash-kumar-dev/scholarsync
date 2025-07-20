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
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import {
  School,
  Article,
  TrendingUp,
  Code,
  ArrowBack,
  OpenInNew,
  FormatQuote,
  Lightbulb
} from '@mui/icons-material';
import { Publication } from '@/lib/parsers/scholar-parser';
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

interface ScholarProcessData {
  name: string;
  affiliation: string;
  researchInterests: string[];
  publications: Publication[];
  citationCount: number;
  hIndex: number;
  i10Index: number;
  skills: string[];
  profileUrl: string;
  metadata: {
    scrapedAt: string;
    processingTime: number;
    publicationCount: number;
  };
}

export default function ScholarProcessPage() {
  const router = useRouter();
  const [scholarData, setScholarData] = useState<ScholarProcessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const data = sessionStorage.getItem('scholarData');
    if (data) {
      setScholarData(JSON.parse(data));
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
            Loading scholar data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!scholarData) {
    return null;
  }

  const { 
    name, 
    affiliation, 
    researchInterests, 
    publications, 
    citationCount, 
    hIndex, 
    i10Index, 
    skills, 
    metadata 
  } = scholarData;

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
          
          <Paper elevation={2} className="p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography variant="h3" className="font-bold mb-2">
                  Google Scholar Analysis
                </Typography>
                <Typography variant="h6" className="opacity-90">
                  Profile processed in {metadata?.processingTime}ms
                </Typography>
              </Box>
              <Box className="text-right">
                <Typography variant="h4" className="font-bold">
                  {citationCount}
                </Typography>
                <Typography variant="body1" className="opacity-90">
                  Total Citations
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
            <Tab label="Overview" icon={<School />} iconPosition="start" />
            <Tab label="Publications" icon={<Article />} iconPosition="start" />
            <Tab label="Metrics" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Project Suggestions" icon={<Lightbulb />} iconPosition="start" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box className="p-6 space-y-6">
              {/* Profile Information */}
              <Card elevation={0} className="border">
                <CardContent>
                  <Typography variant="h5" className="font-semibold mb-4 flex items-center">
                    <School className="mr-2" />
                    Academic Profile
                  </Typography>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box className="space-y-3">
                        <Box>
                          <Typography variant="subtitle2" className="text-gray-500 uppercase text-xs font-medium">
                            Name
                          </Typography>
                          <Typography variant="h6" className="font-medium">
                            {name}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" className="text-gray-500 uppercase text-xs font-medium">
                            Affiliation
                          </Typography>
                          <Typography variant="body1">
                            {affiliation}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <Typography variant="subtitle2" className="text-gray-500 uppercase text-xs font-medium mb-2">
                          Profile Link
                        </Typography>
                        <Link 
                          href={scholarData.profileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          View Google Scholar Profile
                          <OpenInNew className="ml-1 h-4 w-4" />
                        </Link>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Research Interests */}
              <Card elevation={0} className="border">
                <CardContent>
                  <Typography variant="h5" className="font-semibold mb-4">
                    Research Interests
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {researchInterests?.map((interest: string, index: number) => (
                      <Chip 
                        key={index} 
                        label={interest} 
                        variant="filled"
                        className="m-1"
                        sx={{ 
                          backgroundColor: 'rgb(34 197 94)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgb(22 163 74)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Extracted Skills */}
              <Card elevation={0} className="border">
                <CardContent>
                  <Typography variant="h5" className="font-semibold mb-4 flex items-center">
                    <Code className="mr-2" />
                    Technical Skills ({skills?.length || 0} skills extracted)
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-4">
                    Skills extracted from research interests and publications for project suggestions
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

            {/* Add Project Suggestions Button */}
            <Box className="mt-8 text-center">
              <Button
                variant="contained"
                size="large"
                startIcon={<Lightbulb />}
                onClick={() => setTabValue(3)}
                className="bg-green-600 hover:bg-green-700 px-8 py-3"
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
                    <Article className="mr-2" />
                    Publications ({publications?.length || 0} papers)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Title</strong></TableCell>
                          <TableCell><strong>Authors</strong></TableCell>
                          <TableCell><strong>Venue</strong></TableCell>
                          <TableCell><strong>Year</strong></TableCell>
                          <TableCell><strong>Citations</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {publications?.map((pub: Publication, index: number) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Typography variant="body2" className="font-medium">
                                {pub.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" className="text-gray-600">
                                {pub.authors}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" className="text-gray-600">
                                {pub.venue}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {pub.year}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={pub.citations} 
                                size="small" 
                                variant="outlined"
                                icon={<FormatQuote />}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card elevation={0} className="border text-center p-4">
                  <CardContent>
                    <Typography variant="h3" className="font-bold text-blue-600 mb-2">
                      {citationCount}
                    </Typography>
                    <Typography variant="h6" className="text-gray-600">
                      Total Citations
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card elevation={0} className="border text-center p-4">
                  <CardContent>
                    <Typography variant="h3" className="font-bold text-green-600 mb-2">
                      {hIndex}
                    </Typography>
                    <Typography variant="h6" className="text-gray-600">
                      h-index
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card elevation={0} className="border text-center p-4">
                  <CardContent>
                    <Typography variant="h3" className="font-bold text-purple-600 mb-2">
                      {i10Index}
                    </Typography>
                    <Typography variant="h6" className="text-gray-600">
                      i10-index
                    </Typography>
                  </CardContent>
                </Card>
              </div>

              <Card elevation={0} className="border">
                <CardContent>
                  <Typography variant="h6" className="font-semibold mb-4">
                    Metrics Overview
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Publications:</strong> {publications?.length || 0} papers
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Research Areas:</strong> {researchInterests?.length || 0} interests
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Scraped:</strong> {new Date(metadata?.scrapedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      <strong>Skills Extracted:</strong> {skills?.length || 0} technical skills
                    </Typography>
                  </div>
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
                        We couldn't extract enough technical skills from your Google Scholar profile to generate project suggestions.
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