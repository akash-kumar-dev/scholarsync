export const RESUME_PARSING_PROMPTS = {
  SYSTEM_PROMPT: `You are an expert resume parser. Extract structured information from resume text and return it as valid JSON.

IMPORTANT RULES:
1. Return ONLY valid JSON - no markdown, explanations, or extra text
2. If you cannot parse something, use null or empty array
3. Standardize technology names (e.g., "JS" → "JavaScript", "React.js" → "React")
4. Extract skills conservatively - only clear technology skills
5. For dates, use format "Mon YYYY" or "Present"

Expected JSON structure:
{
  "personalInfo": {
    "name": "string | null",
    "email": "string | null", 
    "phone": "string | null",
    "linkedin": "string | null",
    "github": "string | null",
    "website": "string | null"
  },
  "skills": ["string"],
  "education": [{
    "institution": "string | null",
    "degree": "string | null", 
    "field": "string | null",
    "startDate": "string | null",
    "endDate": "string | null",
    "gpa": "string | null"
  }],
  "experience": [{
    "company": "string | null",
    "position": "string | null",
    "startDate": "string | null", 
    "endDate": "string | null",
    "description": ["string"]
  }]
}`,

  USER_PROMPT: (resumeText: string) => `Extract information from this resume text:

${resumeText}

Return the extracted information as JSON following the specified structure.`,

  SKILLS_ENHANCEMENT_PROMPT: (skills: string[], resumeText: string) => `Given these extracted skills: ${skills.join(', ')}

And this resume text context:
${resumeText}

Enhance and standardize the skills list. Return ONLY a JSON array of standardized technology skills:
["skill1", "skill2", "skill3"]

Focus on:
- Programming languages (JavaScript, Python, Java, etc.)
- Frameworks (React, Angular, Django, etc.) 
- Databases (MongoDB, MySQL, PostgreSQL, etc.)
- Cloud/DevOps (AWS, Docker, Kubernetes, etc.)
- Tools (Git, Linux, etc.)

Remove soft skills, general terms, and duplicates.`,

  VALIDATION_PROMPT: (extractedData: any) => `Validate and clean this extracted resume data:

${JSON.stringify(extractedData, null, 2)}

Return the same JSON structure but with:
1. Standardized skill names
2. Proper date formats (Mon YYYY or Present)
3. Cleaned and validated email/phone/URLs
4. Consistent company/institution names

Return ONLY the cleaned JSON.`
};

export const PARSING_STRATEGIES = {
  FULL_PARSE: 'full_parse',
  SKILLS_ONLY: 'skills_only', 
  VALIDATION_ONLY: 'validation_only',
  ENHANCEMENT: 'enhancement'
} as const;

export type ParsingStrategy = typeof PARSING_STRATEGIES[keyof typeof PARSING_STRATEGIES];