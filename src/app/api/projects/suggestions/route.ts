import { NextRequest, NextResponse } from 'next/server';
import { getProjectsBySkills, PROJECT_SUGGESTIONS, ProjectIdea } from '@/lib/data/project-suggestions';

interface SkillMatchedProject extends ProjectIdea {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { skills } = await request.json();

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'Skills array is required' },
        { status: 400 }
      );
    }

    const matchedProjects = getEnhancedProjectMatches(skills);

    const randomProjects = getRandomProjects(5);

    const projectsByCategory = getCategoryBreakdown();

    return NextResponse.json({
      matchedProjects,
      randomProjects,
      projectsByCategory,
      totalProjects: PROJECT_SUGGESTIONS.length,
      userSkills: skills
    });

  } catch (error) {
    console.error('Project suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate project suggestions' },
      { status: 500 }
    );
  }
}

function getEnhancedProjectMatches(userSkills: string[]): SkillMatchedProject[] {
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase().trim());
  
  return PROJECT_SUGGESTIONS.map(project => {
    const normalizedProjectSkills = project.requiredSkills.map(skill => skill.toLowerCase().trim());
    
    const matchedSkills = project.requiredSkills.filter(projectSkill => 
      normalizedUserSkills.some(userSkill => 
        userSkill.includes(projectSkill.toLowerCase()) || 
        projectSkill.toLowerCase().includes(userSkill) ||
        getSimilarityScore(userSkill, projectSkill.toLowerCase()) > 0.7
      )
    );

    const missingSkills = project.requiredSkills.filter(projectSkill => 
      !normalizedUserSkills.some(userSkill => 
        userSkill.includes(projectSkill.toLowerCase()) || 
        projectSkill.toLowerCase().includes(userSkill) ||
        getSimilarityScore(userSkill, projectSkill.toLowerCase()) > 0.7
      )
    );

    const matchPercentage = Math.round((matchedSkills.length / project.requiredSkills.length) * 100);

    return {
      ...project,
      matchPercentage,
      matchedSkills,
      missingSkills
    };
  })
  .filter(project => project.matchPercentage >= 20) // Show projects with at least 20% match
  .sort((a, b) => b.matchPercentage - a.matchPercentage)
  .slice(0, 12); // Top 12 matches
}

function getSimilarityScore(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function getRandomProjects(count: number): ProjectIdea[] {
  const shuffled = [...PROJECT_SUGGESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getCategoryBreakdown() {
  const categories = {};
  PROJECT_SUGGESTIONS.forEach(project => {
    // @ts-ignore
    if (!categories[project.category]) {
      // @ts-ignore
      categories[project.category] = 0;
    }
    // @ts-ignore
    categories[project.category]++;
  });
  return categories;
}