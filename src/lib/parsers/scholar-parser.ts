import * as cheerio from 'cheerio';
import { ScholarData } from '../types/scholar';

export interface ScrapedScholarData {
  name: string;
  affiliation: string;
  researchInterests: string[];
  publications: Publication[];
  citationCount: number;
  hIndex: number;
  i10Index: number;
}

export interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: string;
  citations: number;
  description?: string;
}

export class ScholarParser {
  private profileUrl: string;

  constructor(profileUrl: string) {
    this.profileUrl = this.validateAndNormalizeUrl(profileUrl);
  }

  private validateAndNormalizeUrl(url: string): string {
    // Handle different Google Scholar URL formats
    if (url.includes('scholar.google.com/citations?user=')) {
      return url;
    }
    
    // Extract user ID if it's just the ID
    const userIdMatch = url.match(/([a-zA-Z0-9_-]+)$/);
    if (userIdMatch) {
      return `https://scholar.google.com/citations?user=${userIdMatch[1]}&hl=en`;
    }
    
    throw new Error('Invalid Google Scholar URL format');
  }

  async fetchProfile(): Promise<ScrapedScholarData> {
    try {
      const response = await fetch(this.profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      return this.parseProfile(html);
    } catch (error) {
      throw new Error(`Failed to fetch Google Scholar profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseProfile(html: string): ScrapedScholarData {
    const $ = cheerio.load(html);

    // Extract basic profile information
    const name = $('#gsc_prf_in').text().trim() || 'Unknown';
    const affiliation = $('.gsc_prf_il').first().text().trim() || 'Unknown';

    // Extract research interests
    const researchInterests: string[] = [];
    $('.gsc_prf_int a').each((_, element) => {
      const interest = $(element).text().trim();
      if (interest) {
        researchInterests.push(interest);
      }
    });

    // Extract citation metrics
    const citationCount = parseInt($('.gsc_rsb_std').eq(0).text().replace(/,/g, '') || '0');
    const hIndex = parseInt($('.gsc_rsb_std').eq(2).text() || '0');
    const i10Index = parseInt($('.gsc_rsb_std').eq(4).text() || '0');

    // Extract publications
    const publications: Publication[] = [];
    $('.gsc_a_tr').each((_, element) => {
      const $row = $(element);
      
      const title = $row.find('.gsc_a_at').text().trim();
      const authors = $row.find('.gsc_a_at').next().text().trim();
      const venue = $row.find('.gsc_a_at').next().next().text().trim();
      const year = $row.find('.gsc_a_y .gsc_a_h').text().trim();
      const citations = parseInt($row.find('.gsc_a_c a').text() || '0');

      if (title) {
        publications.push({
          title,
          authors,
          venue,
          year,
          citations
        });
      }
    });

    return {
      name,
      affiliation,
      researchInterests,
      publications,
      citationCount,
      hIndex,
      i10Index
    };
  }

  // Extract skills from research profile for project suggestions
  extractSkills(scholarData: ScrapedScholarData): string[] {
    const skills: string[] = [];

    // Extract from research interests with tech-focused mapping
    const techMappings: { [key: string]: string[] } = {
      'machine learning': ['Machine Learning', 'Python', 'TensorFlow', 'Scikit-learn', 'PyTorch'],
      'artificial intelligence': ['Artificial Intelligence', 'Python', 'Machine Learning', 'Deep Learning'],
      'deep learning': ['Deep Learning', 'TensorFlow', 'PyTorch', 'Neural Networks', 'Python'],
      'computer vision': ['Computer Vision', 'OpenCV', 'Python', 'Image Processing', 'Deep Learning'],
      'natural language processing': ['NLP', 'Natural Language Processing', 'Python', 'NLTK', 'spaCy'],
      'data science': ['Data Science', 'Python', 'Pandas', 'NumPy', 'Matplotlib', 'Jupyter'],
      'data mining': ['Data Mining', 'Python', 'Scikit-learn', 'Data Analysis', 'Statistics'],
      'big data': ['Big Data', 'Apache Spark', 'Hadoop', 'Python', 'Scala', 'Data Processing'],
      'cloud computing': ['Cloud Computing', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'],
      'distributed systems': ['Distributed Systems', 'Microservices', 'Docker', 'Kubernetes', 'System Design'],
      'database': ['Database', 'SQL', 'MongoDB', 'PostgreSQL', 'Data Modeling'],
      'software engineering': ['Software Engineering', 'Programming', 'System Design', 'Software Architecture'],
      'web development': ['Web Development', 'JavaScript', 'HTML', 'CSS', 'React.js', 'Node.js'],
      'mobile computing': ['Mobile Development', 'Android', 'iOS', 'React Native', 'Flutter'],
      'cybersecurity': ['Cybersecurity', 'Security', 'Networking', 'Penetration Testing'],
      'blockchain': ['Blockchain', 'Cryptocurrency', 'Smart Contracts', 'Ethereum', 'Web3'],
      'robotics': ['Robotics', 'Python', 'ROS', 'Computer Vision', 'Machine Learning'],
      'iot': ['IoT', 'Internet of Things', 'Arduino', 'Raspberry Pi', 'Sensors', 'MQTT'],
      'bioinformatics': ['Bioinformatics', 'Python', 'R', 'Data Analysis', 'Machine Learning'],
      'human computer interaction': ['HCI', 'UI/UX', 'User Experience', 'Frontend Development'],
      'computer graphics': ['Computer Graphics', '3D Graphics', 'OpenGL', 'Unity', 'Visualization']
    };

    scholarData.researchInterests.forEach(interest => {
      const lowerInterest = interest.toLowerCase();
      
      Object.keys(techMappings).forEach(key => {
        if (lowerInterest.includes(key)) {
          skills.push(...techMappings[key]);
        }
      });

      skills.push(interest);
    });

    // Extract from publication titles and venues
    scholarData.publications.forEach(pub => {
      const titleLower = pub.title.toLowerCase();
      const venueLower = pub.venue.toLowerCase();
      
      // Common tech keywords in academic papers
      const techKeywords = [
        'javascript', 'python', 'java', 'react', 'tensorflow', 'pytorch', 'opencv',
        'mongodb', 'sql', 'aws', 'docker', 'kubernetes', 'blockchain', 'ethereum',
        'android', 'ios', 'flutter', 'unity', 'nodejs', 'angular', 'vue'
      ];

      techKeywords.forEach(keyword => {
        if (titleLower.includes(keyword) || venueLower.includes(keyword)) {
          skills.push(keyword);
        }
      });

      // Conference/Journal specific mappings
      const venueSkillMappings: { [key: string]: string[] } = {
        'ieee': ['Research', 'Engineering', 'Technology'],
        'acm': ['Computer Science', 'Programming', 'Software Engineering'],
        'springer': ['Research', 'Academic Research'],
        'neurips': ['Machine Learning', 'Deep Learning', 'AI', 'Python'],
        'icml': ['Machine Learning', 'Python', 'Research'],
        'iccv': ['Computer Vision', 'OpenCV', 'Deep Learning', 'Python'],
        'cvpr': ['Computer Vision', 'Image Processing', 'Machine Learning'],
        'emnlp': ['NLP', 'Natural Language Processing', 'Python'],
        'www': ['Web Development', 'Internet Technologies', 'Web Standards'],
        'chi': ['HCI', 'User Experience', 'UI Design'],
        'siggraph': ['Computer Graphics', '3D Graphics', 'Visualization'],
        'vldb': ['Database', 'Big Data', 'SQL', 'Data Management'],
        'sigmod': ['Database Systems', 'SQL', 'Data Processing'],
        'isca': ['Computer Architecture', 'System Design', 'Hardware'],
        'osdi': ['Operating Systems', 'Distributed Systems', 'System Programming'],
        'nsdi': ['Networking', 'Distributed Systems', 'Network Programming'],
        'usenix': ['Systems', 'Security', 'Operating Systems'],
        'ccs': ['Cybersecurity', 'Security', 'Cryptography'],
        'oakland': ['Security', 'Privacy', 'Cybersecurity']
      };

      Object.keys(venueSkillMappings).forEach(venue => {
        if (venueLower.includes(venue)) {
          skills.push(...venueSkillMappings[venue]);
        }
      });
    });

    const cleanedSkills = skills
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1 && skill.length < 50)
      .map(skill => {
        const standardized = skill.toLowerCase();
 
        if (standardized.includes('javascript') || standardized === 'js') return 'JavaScript';
        if (standardized.includes('python')) return 'Python';
        if (standardized.includes('machine learning')) return 'Machine Learning';
        if (standardized.includes('deep learning')) return 'Deep Learning';
        if (standardized.includes('tensorflow')) return 'TensorFlow';
        if (standardized.includes('pytorch')) return 'PyTorch';
        if (standardized.includes('opencv')) return 'OpenCV';
        if (standardized.includes('react')) return 'React.js';
        if (standardized.includes('node')) return 'Node.js';
        if (standardized.includes('mongodb')) return 'MongoDB';
        if (standardized.includes('aws')) return 'AWS';
        if (standardized.includes('docker')) return 'Docker';
        if (standardized.includes('kubernetes')) return 'Kubernetes';
        
        return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
      });

    return [...new Set(cleanedSkills)];
  }
}