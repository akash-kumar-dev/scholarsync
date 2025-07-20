export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export function extractEmails(text: string): string[] {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return text.match(emailRegex) || [];
}

export function extractPhones(text: string): string[] {
  const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  return text.match(phoneRegex) || [];
}

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  return text.match(urlRegex) || [];
}

export function splitIntoSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  const sectionHeaders = [
    'summary',
    'education',
    'work experience',
    'experience', 
    'employment',
    'skills and interests',
    'skills',
    'technical skills',
    'projects',
    'certifications',
    'activities and certifications',
    'activities',
    'achievements'
  ];

  const lines = text.split('\n');
  let currentSection = 'general';
  let currentContent = '';

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    const matchedSection = sectionHeaders.find(header => 
      lowerLine === header || 
      lowerLine.startsWith(header + ':') ||
      lowerLine.startsWith(header + ' ') ||
      (lowerLine.includes(header) && lowerLine.length < header.length + 10)
    );

    if (matchedSection) {
      if (currentContent.trim()) {
        sections[currentSection] = currentContent.trim();
      }

      currentSection = matchedSection;
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  }

  if (currentContent.trim()) {
    sections[currentSection] = currentContent.trim();
  }

  return sections;
}
