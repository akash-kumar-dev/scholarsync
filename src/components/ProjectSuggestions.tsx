'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Code,
  Schedule,
  TrendingUp,
  Lightbulb,
  Star,
  Launch,
  Close,
  FilterList,
  Category,
  Timeline,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';

interface SkillMatchedProject {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  estimatedTime: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

interface ProjectSuggestionsProps {
  userSkills: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const ProjectSuggestions: React.FC<ProjectSuggestionsProps> = ({ userSkills }) => {
  const [projects, setProjects] = useState<SkillMatchedProject[]>([]);
  const [randomProjects, setRandomProjects] = useState<SkillMatchedProject[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<SkillMatchedProject | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');

  useEffect(() => {
    fetchProjectSuggestions();
  }, [userSkills]);

  const fetchProjectSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: userSkills })
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.matchedProjects || []);
        setRandomProjects(data.randomProjects || []);
        setCategoryStats(data.projectsByCategory || {});
      } else {
        console.error('Failed to fetch project suggestions:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch project suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web Development': return <Code />;
      case 'Mobile Development': return <Code />;
      case 'AI/ML': return <TrendingUp />;
      case 'Data Science': return <TrendingUp />;
      case 'DevOps': return <Timeline />;
      case 'Blockchain': return <Star />;
      default: return <Category />;
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage >= 40) return 'info';
    return 'error';
  };

  const filteredProjects = filterDifficulty 
    ? projects.filter(p => p.difficulty === filterDifficulty)
    : projects;

  const ProjectCard = ({ project }: { project: SkillMatchedProject }) => {
    const matchedSkills = project.matchedSkills || [];
    const missingSkills = project.missingSkills || [];
    const requiredSkills = project.requiredSkills || [];
    const matchPercentage = project.matchPercentage || 0;

    return (
      <Card 
        elevation={2}
        className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
        onClick={() => setSelectedProject(project)}
      >
        <CardContent className="p-6">
          {/* Header */}
          <Box className="flex items-start justify-between mb-4">
            <Box className="flex items-center space-x-2">
              {getCategoryIcon(project.category)}
              <Typography variant="h6" className="font-semibold">
                {project.title || 'Untitled Project'}
              </Typography>
            </Box>
            <Badge 
              badgeContent={`${matchPercentage}%`} 
              color={getMatchColor(matchPercentage)}
              className="ml-2"
            />
          </Box>

          {/* Match Progress */}
          <Box className="mb-4">
            <Box className="flex justify-between items-center mb-1">
              <Typography variant="body2" className="text-gray-600">
                Skill Match
              </Typography>
              <Typography variant="body2" className="font-medium">
                {matchedSkills.length}/{requiredSkills.length} skills
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={matchPercentage} 
              color={getMatchColor(matchPercentage)}
              className="h-2 rounded"
            />
          </Box>

          {/* Description */}
          <Typography variant="body2" className="text-gray-700 mb-4 line-clamp-3">
            {project.description ? `${project.description.substring(0, 150)}...` : 'No description available'}
          </Typography>

          {/* Matched Skills */}
          {matchedSkills.length > 0 && (
            <Box className="mb-3">
              <Typography variant="caption" className="text-green-600 font-medium mb-1 block">
                ✓ Your Skills ({matchedSkills.length})
              </Typography>
              <Box className="flex flex-wrap gap-1">
                {matchedSkills.slice(0, 3).map((skill, index) => (
                  <Chip 
                    key={index}
                    label={skill}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                ))}
                {matchedSkills.length > 3 && (
                  <Chip 
                    label={`+${matchedSkills.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Missing Skills */}
          {missingSkills.length > 0 && (
            <Box className="mb-4">
              <Typography variant="caption" className="text-orange-600 font-medium mb-1 block">
                📚 Learn ({missingSkills.length})
              </Typography>
              <Box className="flex flex-wrap gap-1">
                {missingSkills.slice(0, 2).map((skill, index) => (
                  <Chip 
                    key={index}
                    label={skill}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                ))}
                {missingSkills.length > 2 && (
                  <Chip 
                    label={`+${missingSkills.length - 2} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Footer */}
          <Box className="flex justify-between items-center">
            <Box className="flex items-center space-x-4">
              <Chip 
                label={project.difficulty || 'Unknown'}
                color={getDifficultyColor(project.difficulty)}
                size="small"
              />
              <Box className="flex items-center text-gray-500">
                <Schedule className="w-4 h-4 mr-1" />
                <Typography variant="caption">
                  {project.estimatedTime || 'TBD'}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Launch />}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProject(project);
              }}
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center py-12">
        <CircularProgress />
        <Typography variant="h6" className="ml-4">
          Generating project suggestions...
        </Typography>
      </Box>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Box className="text-center py-12">
        <Alert severity="info" className="mb-4">
          <Typography variant="h6">
            No project suggestions found
          </Typography>
          <Typography variant="body2">
            We couldn't find any projects matching your skills. This might be due to:
          </Typography>
          <ul className="text-left mt-2">
            <li>• Limited skill extraction from your profile</li>
            <li>• Server connectivity issues</li>
            <li>• No matching projects in our database</li>
          </ul>
        </Alert>
        <Button
          variant="contained"
          onClick={fetchProjectSuggestions}
          className="mt-4"
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      {/* Header */}
      <Box className="text-center mb-8">
        <Typography variant="h4" className="font-bold mb-2">
          🚀 Project Suggestions
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Based on your {userSkills?.length || 0} extracted skills
        </Typography>
      </Box>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card elevation={1}>
          <CardContent className="text-center p-4">
            <Typography variant="h3" className="font-bold text-blue-600">
              {projects.length}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Matched Projects
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={1}>
          <CardContent className="text-center p-4">
            <Typography variant="h3" className="font-bold text-green-600">
              {projects.filter(p => (p.matchPercentage || 0) >= 70).length}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              High Match (70%+)
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={1}>
          <CardContent className="text-center p-4">
            <Typography variant="h3" className="font-bold text-orange-600">
              {projects.filter(p => p.difficulty === 'Beginner').length}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Beginner Friendly
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={1}>
          <CardContent className="text-center p-4">
            <Typography variant="h3" className="font-bold text-purple-600">
              {Object.keys(categoryStats).length}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Categories
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card elevation={1}>
        <CardContent>
          <Box className="flex items-center justify-between">
            <Typography variant="h6" className="flex items-center">
              <FilterList className="mr-2" />
              Filters
            </Typography>
            <Box className="flex space-x-2">
              {['', 'Beginner', 'Intermediate', 'Advanced'].map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={filterDifficulty === difficulty ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setFilterDifficulty(difficulty)}
                >
                  {difficulty || 'All'}
                </Button>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Alert severity="info" className="text-center">
          <Typography variant="h6">
            No projects match your current filter criteria
          </Typography>
          <Typography variant="body2">
            Try adjusting the difficulty filter or explore random projects below
          </Typography>
        </Alert>
      )}

      {/* Random Projects Section */}
      {randomProjects && randomProjects.length > 0 && (
        <Box className="mt-12">
          <Typography variant="h5" className="font-semibold mb-4">
            🎲 Explore More Projects
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomProjects.slice(0, 6).map((project) => (
              <ProjectCard key={`random-${project.id}`} project={project} />
            ))}
          </div>
        </Box>
      )}

      {/* Project Detail Modal */}
      <Dialog 
        open={!!selectedProject} 
        onClose={() => setSelectedProject(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle className="flex items-center justify-between">
              <Box className="flex items-center space-x-2">
                {getCategoryIcon(selectedProject.category)}
                <Typography variant="h5" className="font-semibold">
                  {selectedProject.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedProject(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box className="space-y-6">
                {/* Match Statistics */}
                <Box className="bg-gray-50 p-4 rounded-lg">
                  <Typography variant="h6" className="mb-3">
                    📊 Skill Analysis
                  </Typography>
                  <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Box className="text-center">
                      <Typography variant="h4" className="font-bold text-blue-600">
                        {selectedProject.matchPercentage || 0}%
                      </Typography>
                      <Typography variant="body2">Match Score</Typography>
                    </Box>
                    <Box className="text-center">
                      <Typography variant="h4" className="font-bold text-green-600">
                        {selectedProject.matchedSkills?.length || 0}
                      </Typography>
                      <Typography variant="body2">Your Skills</Typography>
                    </Box>
                    <Box className="text-center">
                      <Typography variant="h4" className="font-bold text-orange-600">
                        {selectedProject.missingSkills?.length || 0}
                      </Typography>
                      <Typography variant="body2">To Learn</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Description */}
                <Box>
                  <Typography variant="h6" className="mb-2">
                    📝 Project Description
                  </Typography>
                  <Typography variant="body1" className="text-gray-700">
                    {selectedProject.description || 'No description available'}
                  </Typography>
                </Box>

                {/* Skills Breakdown */}
                <Box>
                  <Typography variant="h6" className="mb-3">
                    🔧 Required Skills
                  </Typography>
                  
                  {selectedProject.matchedSkills && selectedProject.matchedSkills.length > 0 && (
                    <Box className="mb-4">
                      <Typography variant="subtitle2" className="text-green-600 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Skills You Have ({selectedProject.matchedSkills.length})
                      </Typography>
                      <Box className="flex flex-wrap gap-2">
                        {selectedProject.matchedSkills.map((skill, index) => (
                          <Chip 
                            key={index}
                            label={skill}
                            color="success"
                            variant="filled"
                            icon={<CheckCircle />}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {selectedProject.missingSkills && selectedProject.missingSkills.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" className="text-orange-600 mb-2 flex items-center">
                        <Info className="w-4 h-4 mr-1" />
                        Skills to Learn ({selectedProject.missingSkills.length})
                      </Typography>
                      <Box className="flex flex-wrap gap-2">
                        {selectedProject.missingSkills.map((skill, index) => (
                          <Chip 
                            key={index}
                            label={skill}
                            color="warning"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Project Details */}
                <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Box>
                    <Typography variant="subtitle2" className="text-gray-500 mb-1">
                      Difficulty
                    </Typography>
                    <Chip 
                      label={selectedProject.difficulty || 'Unknown'}
                      color={getDifficultyColor(selectedProject.difficulty)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" className="text-gray-500 mb-1">
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {selectedProject.category || 'Uncategorized'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" className="text-gray-500 mb-1">
                      Estimated Time
                    </Typography>
                    <Typography variant="body1">
                      {selectedProject.estimatedTime || 'TBD'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<Star />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Project
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ProjectSuggestions;