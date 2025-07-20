import { ProjectIdea } from '../data/project-suggestions';

export interface ProjectMatch {
  project: ProjectIdea;
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  skillSources: {
    fromResume: string[];
    fromScholar: string[];
  };
}

export function findBestMatches(
  resumeSkills: string[] = [], 
  scholarSkills: string[] = [], 
  limit: number = 10
): ProjectMatch[] {
  const { PROJECT_SUGGESTIONS } = require('../data/project-suggestions');
  
  const allUserSkills = [...new Set([...resumeSkills, ...scholarSkills])];
  
  const matches: ProjectMatch[] = PROJECT_SUGGESTIONS.map((project: ProjectIdea) => {
    const normalizedUserSkills = allUserSkills.map(skill => skill.toLowerCase());
    const normalizedProjectSkills = project.requiredSkills.map(skill => skill.toLowerCase());
    
    const matchingSkills = project.requiredSkills.filter(skill =>
      normalizedUserSkills.some(userSkill =>
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    const missingSkills = project.requiredSkills.filter(skill =>
      !normalizedUserSkills.some(userSkill =>
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    const fromResume = matchingSkills.filter(skill =>
      resumeSkills.some(resumeSkill =>
        resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(resumeSkill.toLowerCase())
      )
    );

    const fromScholar = matchingSkills.filter(skill =>
      scholarSkills.some(scholarSkill =>
        scholarSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(scholarSkill.toLowerCase())
      )
    );
    
    const matchPercentage = Math.round((matchingSkills.length / project.requiredSkills.length) * 100);
    
    return {
      project,
      matchPercentage,
      matchingSkills,
      missingSkills,
      skillSources: {
        fromResume,
        fromScholar
      }
    };
  });
  
  return matches
    .filter(match => match.matchPercentage >= 20)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, limit);
}

export function getRecommendedLearningPath(resumeSkills: string[], scholarSkills: string[]): string[] {
  const matches = findBestMatches(resumeSkills, scholarSkills, 50);
  const skillFrequency: { [skill: string]: number } = {};
  
  matches.forEach(match => {
    match.missingSkills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });
  });
  
  return Object.entries(skillFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([skill]) => skill);
}

export function getAcademicProjects(scholarSkills: string[], limit: number = 5): ProjectMatch[] {
  const matches = findBestMatches([], scholarSkills, 50);
  
  const academicCategories = ['AI/ML', 'Data Science', 'Game Development'];
  const academicProjects = matches.filter(match => 
    academicCategories.includes(match.project.category) || 
    match.project.difficulty === 'Advanced'
  );
  
  return academicProjects.slice(0, limit);
}