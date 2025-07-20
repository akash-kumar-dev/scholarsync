import { TechStackData, PersonalInfo, Education, Experience } from '../types/resume';
import { cleanText, splitIntoSections } from '../utils/text-cleaner';

export class ResumeExtractor {
  private text: string;
  private sections: Record<string, string>;

  constructor(rawText: string) {
    this.text = cleanText(rawText);
    this.sections = splitIntoSections(this.text);
  }

  extractPersonalInfo(): PersonalInfo {
    const personalInfo: PersonalInfo = {};

    const lines = this.text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      const words = firstLine.split(/\s+/);
      
      if (words.length >= 2) {
        personalInfo.name = `${words[0]} ${words[1]}`;
      } else if (words.length === 1) {
        personalInfo.name = words[0];
      }
    }

    const emailMatch = this.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      personalInfo.email = emailMatch[0];
    }

    const phonePatterns = [
      /(\+91[-.\s]?)?[6-9]\d{9}/g, // Indian mobile numbers
      /(\+91[-.\s]?)?[0-9]{10}/g, // General 10-digit numbers
      /(\+?[0-9]{1,4}[-.\s]?)?[0-9]{10,}/g // Generic international
    ];

    for (const pattern of phonePatterns) {
      const matches = this.text.match(pattern);
      if (matches && matches.length > 0) {
        personalInfo.phone = matches[0].trim();
        break;
      }
    }

    this.extractSocialProfiles(personalInfo);

    return personalInfo;
  }

  private extractSocialProfiles(personalInfo: PersonalInfo): void {
    const githubPatterns = [
      /github\.com\/([a-zA-Z0-9\-_]+)/gi,
      /github:?\s*([a-zA-Z0-9\-_]+)/gi,
      /git:?\s*github\.com\/([a-zA-Z0-9\-_]+)/gi
    ];

    for (const pattern of githubPatterns) {
      const matches = [...this.text.matchAll(pattern)];
      if (matches.length > 0) {
        const username = matches[0][1];
        personalInfo.github = `https://github.com/${username}`;
        break;
      }
    }

    const linkedinPatterns = [
      /linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/gi,
      /linkedin:?\s*([a-zA-Z0-9\-_]+)/gi,
      /in\.linkedin\.com\/([a-zA-Z0-9\-_]+)/gi
    ];

    for (const pattern of linkedinPatterns) {
      const matches = [...this.text.matchAll(pattern)];
      if (matches.length > 0) {
        const username = matches[0][1];
        personalInfo.linkedin = `https://linkedin.com/in/${username}`;
        break;
      }
    }

    const websitePatterns = [
      /([a-zA-Z0-9\-]+\.is-a\.dev)/gi,
      /([a-zA-Z0-9\-]+\.dev)/gi,
      /([a-zA-Z0-9\-]+\.vercel\.app)/gi,
      /([a-zA-Z0-9\-]+\.netlify\.app)/gi,
      /(https?:\/\/[a-zA-Z0-9\-]+\.[a-zA-Z]{2,})/gi
    ];

    for (const pattern of websitePatterns) {
      const matches = [...this.text.matchAll(pattern)];
      if (matches.length > 0) {
        let website = matches[0][1] || matches[0][0];
        if (!website.startsWith('http')) {
          website = `https://${website}`;
        }
        personalInfo.website = website;
        break;
      }
    }

    // Twitter/X patterns
    const twitterPatterns = [
      /x\.com\/([a-zA-Z0-9_]+)/gi,
      /twitter\.com\/([a-zA-Z0-9_]+)/gi
    ];

    for (const pattern of twitterPatterns) {
      const matches = [...this.text.matchAll(pattern)];
      if (matches.length > 0) {
        const username = matches[0][1];
        if (!personalInfo.website) {
          personalInfo.website = `https://x.com/${username}`;
        }
        break;
      }
    }
  }

  extractEducation(): Education[] {
    const education: Education[] = [];
    const educationSection = this.sections.education || '';

    if (!educationSection) return education;

    const lines = educationSection.split('\n');
    let currentEducation: Partial<Education> = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const institutionPatterns = [
        /NATIONAL INSTITUTE OF TECHNOLOGY|NIT/i,
        /INDIAN INSTITUTE OF TECHNOLOGY|IIT/i,
        /UNIVERSITY|COLLEGE|INSTITUTE|SCHOOL/i
      ];

      const hasInstitution = institutionPatterns.some(pattern => pattern.test(trimmedLine));
      if (hasInstitution && !currentEducation.institution) {
        currentEducation.institution = trimmedLine;
      }

      const degreePatterns = [
        /bachelor.*technology|b\.?tech|b\.?e\./i,
        /master.*technology|m\.?tech|m\.?e\./i,
        /bachelor.*science|b\.?sc|b\.?s\./i,
        /master.*science|m\.?sc|m\.?s\./i,
        /bachelor.*arts|b\.?a\./i,
        /ph\.?d|doctorate/i
      ];

      const degreeMatch = degreePatterns.find(pattern => pattern.test(trimmedLine));
      if (degreeMatch && !currentEducation.degree) {
        currentEducation.degree = trimmedLine;
      }

      const fieldPatterns = [
        /major in ([^,\n]+)/i,
        /specialization in ([^,\n]+)/i,
        /(electrical.*electronics|computer.*science|mechanical|civil|chemical)/i
      ];

      for (const pattern of fieldPatterns) {
        const fieldMatch = trimmedLine.match(pattern);
        if (fieldMatch && !currentEducation.field) {
          currentEducation.field = fieldMatch[1] || fieldMatch[0];
          break;
        }
      }

      const gpaMatch = trimmedLine.match(/(?:cgpa|gpa):?\s*([0-9]+\.?[0-9]*)/i);
      if (gpaMatch) {
        currentEducation.gpa = gpaMatch[1];
      }

      const dateMatch = trimmedLine.match(/([A-Za-z]{3}\s+\d{4})\s*[-–]\s*([A-Za-z]{3}\s+\d{4}|Present)/i);
      if (dateMatch) {
        currentEducation.startDate = dateMatch[1];
        currentEducation.endDate = dateMatch[2];
      }

      const locationMatch = trimmedLine.match(/([A-Za-z\s]+,\s*[A-Za-z\s]+)/);
      if (locationMatch && !currentEducation.location) {
        currentEducation.location = locationMatch[1];
      }
    }

    if (currentEducation.institution || currentEducation.degree) {
      education.push(currentEducation as Education);
    }

    return education;
  }

  extractExperience(): Experience[] {
    const experience: Experience[] = [];
    const experienceSection = this.sections['work experience'] || this.sections.experience || '';

    if (!experienceSection) return experience;

    const lines = experienceSection.split('\n');
    let currentJob: Partial<Experience> = {};
    let isCollectingDescription = false;
    let description: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const companyPatterns = [
        /^[A-Z][A-Z\s&]+$/,  // All caps company names
        /^[A-Za-z0-9\s&]+\s+(India|USA|CA|Palo Alto)/i // Company with location
      ];

      const isCompany = companyPatterns.some(pattern => pattern.test(trimmedLine));
      if (isCompany && !currentJob.company && !trimmedLine.includes('•')) {
        if (currentJob.position && currentJob.company) {
          if (description.length > 0) {
            currentJob.description = description;
          }
          experience.push(currentJob as Experience);
        }
        
        currentJob = { company: trimmedLine };
        description = [];
        isCollectingDescription = false;
      }

      const positionPatterns = [
        /developer|engineer|contributor|mentor|ambassador/i,
        /intern|associate|senior|junior|lead/i,
        /open source/i
      ];

      const hasPosition = positionPatterns.some(pattern => pattern.test(trimmedLine));
      if (hasPosition && !currentJob.position && currentJob.company) {
        currentJob.position = trimmedLine;
        isCollectingDescription = true;
      }

      const dateMatch = trimmedLine.match(/([A-Za-z]{3}\s+\d{4})\s*[-–]\s*([A-Za-z]{3}\s+\d{4}|Present)/i);
      if (dateMatch) {
        currentJob.startDate = dateMatch[1];
        currentJob.endDate = dateMatch[2];
      }

      if (isCollectingDescription && trimmedLine.startsWith('•')) {
        description.push(trimmedLine.substring(1).trim());
      }

      if (trimmedLine.toLowerCase().includes('tech stack:')) {
        description.push(trimmedLine);
      }
    }
    
    if (currentJob.position && currentJob.company) {
      if (description.length > 0) {
        currentJob.description = description;
      }
      experience.push(currentJob as Experience);
    }

    return experience;
  }

  extractAllTechSkills(): string[] {
    const skills: string[] = [];

    // Comprehensive tech skill patterns
    const techPatterns = [
      // Programming Languages
      /\b(javascript|java|python|c\+\+|c#|php|ruby|go|rust|swift|kotlin|typescript|c|scala|perl|r|matlab|sql|dart|objective-c|bash)\b/gi,
      
      // Frontend Technologies
      /\b(react|angular|vue|html|css|sass|scss|bootstrap|tailwind|jquery|webpack|babel|nextjs|next\.js|nuxt|svelte|ember)\b/gi,
      
      // Backend Technologies
      /\b(node\.?js|express|django|flask|spring|laravel|rails|fastapi|nestjs|koa|asp\.net|gin|echo|fiber|hono)\b/gi,
      
      // Databases & ORM
      /\b(mysql|postgresql|mongodb|redis|sqlite|oracle|cassandra|dynamodb|firebase|firestore|mariadb|neo4j|elasticsearch|prisma)\b/gi,
      
      // Cloud & DevOps
      /\b(aws|azure|gcp|google\s?cloud|docker|kubernetes|jenkins|gitlab|github|git|ci\/cd|vercel|netlify|heroku|terraform|ansible|serverless|cloudflare|monorepo|turbo)\b/gi,
      
      // Development Tools
      /\b(postman|vs\s?code|visual\s?studio|intellij|eclipse|android\s?studio|xcode|figma|photoshop|sketch|linux|windows|ubuntu|macos)\b/gi,
      
      // Data Science & AI
      /\b(machine\s?learning|data\s?science|artificial\s?intelligence|tensorflow|pytorch|pandas|numpy|scikit-learn|opencv|nlp|deep\s?learning|jupyter|anaconda|keras|spark)\b/gi,
      
      // Web Technologies
      /\b(graphql|rest|api|microservices|socket\.?io|websocket|json|xml|ajax|cors|oauth|jwt|material\s?ui)\b/gi,

      // Mobile Development
      /\b(react\s?native|flutter|xamarin|ionic|cordova|phonegap|android|ios|swift|kotlin)\b/gi,

      // Testing & Quality
      /\b(jest|cypress|selenium|junit|mocha|chai|testing|unit\s?testing|integration\s?testing|e2e|tdd|bdd|jscodeshift)\b/gi,

      // Blockchain & Web3
      /\b(blockchain|ethereum|solidity|web3|smart\s?contracts|solana|nft|cryptocurrency|defi)\b/gi,

      // Security & Networking
      /\b(wireshark|burp\s?suite|nmap|networking|protocols|cybersecurity|penetration\s?testing)\b/gi,

      // Other Technologies
      /\b(arduino|raspberry\s?pi|iot|mqtt|tcp\/ip|codemod|ast|abstract\s?syntax\s?trees)\b/gi,

      // Frameworks & Libraries
      /\b(redux|mobx|axios|lodash|moment|dayjs|chart\.js|d3\.js|three\.js|gsap|framer\s?motion|nextauth)\b/gi,

      // Version Control & Collaboration
      /\b(git|github|gitlab|bitbucket|svn|mercurial|slack|discord|jira|trello|notion)\b/gi,

      // Operating Systems & Environment
      /\b(linux|ubuntu|centos|debian|windows|macos|unix|bash|powershell|zsh|terminal)\b/gi
    ];

    for (const pattern of techPatterns) {
      const matches = this.text.match(pattern);
      if (matches) {
        skills.push(...matches.map(match => match.trim()));
      }
    }

    const skillSectionMatches = this.text.match(/(?:tech\s*stacks?|skills?|technologies?|tools?|platforms?)[:\s]*([^.\n]*)/gi);
    if (skillSectionMatches) {
      for (const match of skillSectionMatches) {
        const skillList = match.replace(/^[^:]*:?\s*/, '').trim();
        const individualSkills = skillList.split(/[,•\-\n|/&\s]+/)
          .map(skill => skill.trim())
          .filter(skill => skill.length > 1 && skill.length < 30);
        skills.push(...individualSkills);
      }
    }

    const cleanedSkills = skills
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1 && skill.length < 30)
      .filter(skill => !skill.toLowerCase().match(/^(skills?|technologies?|tools?|platforms?|languages?|summary|experience|education|projects?|tech|stack)$/))
      .map(skill => {
        const standardized = skill.toLowerCase();
        
        // Common standardizations
        if (standardized.includes('javascript') || standardized === 'js') return 'JavaScript';
        if (standardized.includes('node') && standardized.includes('js')) return 'Node.js';
        if (standardized.includes('react') && !standardized.includes('native')) return 'React.js';
        if (standardized.includes('react') && standardized.includes('native')) return 'React Native';
        if (standardized.includes('next')) return 'Next.js';
        if (standardized.includes('express')) return 'Express.js';
        if (standardized.includes('vue')) return 'Vue.js';
        if (standardized.includes('angular')) return 'Angular';
        if (standardized.includes('python')) return 'Python';
        if (standardized.includes('java') && !standardized.includes('script')) return 'Java';
        if (standardized.includes('html')) return 'HTML';
        if (standardized.includes('css')) return 'CSS';
        if (standardized.includes('mongodb')) return 'MongoDB';
        if (standardized.includes('mysql')) return 'MySQL';
        if (standardized.includes('postgresql')) return 'PostgreSQL';
        if (standardized.includes('firebase')) return 'Firebase';
        if (standardized.includes('aws')) return 'AWS';
        if (standardized.includes('docker')) return 'Docker';
        if (standardized.includes('kubernetes')) return 'Kubernetes';
        if (standardized.includes('git') && !standardized.includes('hub')) return 'Git';
        if (standardized.includes('github')) return 'GitHub';
        if (standardized.includes('material') && standardized.includes('ui')) return 'Material UI';
        if (standardized.includes('tailwind')) return 'Tailwind CSS';
        if (standardized.includes('bootstrap')) return 'Bootstrap';
        if (standardized.includes('prisma')) return 'Prisma ORM';
        if (standardized.includes('nextauth')) return 'NextAuth';
        
        return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
      });

    // Remove duplicates and return
    return [...new Set(cleanedSkills)];
  }

  extract(): Omit<TechStackData, 'metadata'> {
    const allTechSkills = this.extractAllTechSkills();
    const personalInfo = this.extractPersonalInfo();
    const education = this.extractEducation();
    const experience = this.extractExperience();

    return {
      personalInfo,
      skills: allTechSkills,
      education,
      experience,
      rawText: this.text
    };
  }
}