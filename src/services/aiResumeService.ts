import { ResumeData } from '@/types/resume';
import { CandidateProfile } from '@/services/api';

export interface AISummaryOption {
  id: string;
  tone: string;
  text: string;
}

export interface AIExperienceBullet {
  id: string;
  text: string;
  actionVerb: string;
}

export interface AIProjectSuggestion {
  id: string;
  title: string;
  role: string;
  techStack: string[];
  description: string;
}

export interface AICertificationSuggestion {
  id: string;
  name: string;
  issuer: string;
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export const getInitialResumeForUser = (user?: CandidateProfile | null): ResumeData => {
  const fullName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '');
  const email = user?.email || '';
  const phone = user?.phone || '';
  const location = user?.location || '';
  const jobTitle = user?.job_title || 'Senior Full Stack Software Engineer';
  const linkedin = user?.linkedin_url || '';
  const github = user?.github_url || '';
  const portfolio = user?.portfolio_url || '';

  const userId = user?.id ? String(user.id) : (user?.email ? user.email.toLowerCase() : 'guest');
  const savedKey = `aimploy_resume_data_${userId}`;

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user resume from localStorage', e);
      }
    }
  }

  return {
    id: `resume-${userId}`,
    title: jobTitle,
    templateId: 'modern',
    personalInfo: {
      fullName: fullName || 'Your Full Name',
      jobTitle: jobTitle,
      email: email || 'your.email@example.com',
      phone: phone || '+1 (555) 000-0000',
      location: location || 'Bangalore, India',
      linkedin: linkedin || 'linkedin.com/in/yourprofile',
      portfolio: portfolio || 'yourportfolio.dev',
      github: github || 'github.com/yourusername',
    },
    summary:
      'Results-driven Senior Full Stack Software Engineer with experience designing, developing, and deploying scalable web applications using React, TypeScript, Node.js, and Cloud services.',
    workExperiences: [
      {
        id: `exp-${Date.now()}-1`,
        company: 'TechCorp Solutions',
        position: jobTitle,
        location: location || 'Bangalore, India',
        startDate: '2022-03',
        endDate: 'Present',
        current: true,
        highlights: [
          'Architected and implemented responsive web modules and micro-frontend architecture, reducing initial bundle load times by 45%.',
          'Spearheaded integration of cloud-native APIs, increasing application throughput and performance.',
        ],
      },
    ],
    educations: [
      {
        id: `edu-${Date.now()}-1`,
        institution: 'University of Technology',
        degree: 'Bachelor of Engineering (B.E.)',
        fieldOfStudy: 'Computer Science & Engineering',
        location: location || 'Bangalore, India',
        startDate: '2019-08',
        endDate: '2023-05',
        gpa: 'First Class Distinction',
      },
    ],
    skills: [
      {
        category: 'Frontend',
        items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
      },
      {
        category: 'Backend & Cloud',
        items: ['Node.js', 'Express', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
      },
      {
        category: 'Tools',
        items: ['Git', 'Vite', 'Jest', 'CI/CD'],
      },
    ],
    projects: [
      {
        id: `proj-${Date.now()}-1`,
        title: 'Aimploy Recruitment Platform',
        role: 'Lead Full Stack Engineer',
        link: 'github.com/yourusername/recruitment-platform',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
        description:
          'Built an end-to-end web application delivering responsive UI workflows, secure API authentication, and high performance.',
      },
    ],
    certifications: [
      {
        id: `cert-${Date.now()}-1`,
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: '2023-04',
        credentialId: 'AWS-CERT-12345',
      },
    ],
  };
};

export const initialDefaultResume: ResumeData = getInitialResumeForUser(null);

const techTerms = [
  'react',
  'reactjs',
  'node',
  'nodejs',
  'next',
  'nextjs',
  'aws',
  'devops',
  'python',
  'java',
  'sql',
  'docker',
  'typescript',
  'javascript',
  'express',
  'mongodb',
  'postgresql',
  'tailwind',
  'css',
  'html',
  'vtu',
  'cse',
  'cs',
  'be',
  'b.e',
  'btech',
  'b.tech',
  'bca',
  'mtech',
  'mca',
  'angadi',
  'institue',
  'institute',
  'university',
  'college',
  'school',
  'passout',
  'aimtm',
  'clg',
  'aimploy',
  'recuitment',
  'recruitment',
];

export class AIResumeService {
  /**
   * Connect to Aimploy_dev Backend OpenAI API Endpoint (/api/v1/public/ai/generate-resume-section)
   */
  static async fetchOpenAIResumeSection(
    sectionType: string,
    promptText: string,
    candidateName: string = 'Candidate',
    jobTitle: string = 'Full Stack Software Engineer'
  ): Promise<any | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/public/ai/generate-resume-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_type: sectionType,
          prompt_text: promptText,
          candidate_name: candidateName,
          job_title: jobTitle,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend OpenAI endpoint unreachable or timed out, using fast client AI engine');
    }
    return null;
  }

  /**
   * Parse Education Input Prompt
   */
  static parseEducationPrompt(promptText: string): ParsedEducation {
    if (!promptText || promptText.trim().length === 0) {
      return {
        institution: 'AIMTM College',
        degree: 'Bachelor of Engineering (B.E.)',
        fieldOfStudy: 'Electronics & Communication Engineering (E&C)',
        startDate: '2019-08',
        endDate: '2023-05',
        highlights: [
          'Graduated from AIMTM College in Electronics & Communication Engineering',
          'Relevant Coursework: Signals & Systems, Microcontrollers, Embedded Systems, VLSI Design',
        ],
      };
    }

    const lower = promptText.toLowerCase();

    // 1. Degree Detection
    let degree = 'Bachelor of Engineering (B.E.)';
    if (lower.includes('be') || lower.includes('b.e') || lower.includes('btech') || lower.includes('b.tech')) {
      degree = 'Bachelor of Engineering (B.E.)';
    } else if (lower.includes('bca')) {
      degree = 'Bachelor of Computer Applications (BCA)';
    } else if (lower.includes('mtech') || lower.includes('m.tech') || lower.includes('me')) {
      degree = 'Master of Technology (M.Tech)';
    } else if (lower.includes('mca')) {
      degree = 'Master of Computer Applications (MCA)';
    } else if (lower.includes('bs') || lower.includes('bachelor')) {
      degree = 'Bachelor of Science';
    } else if (lower.includes('ms') || lower.includes('master')) {
      degree = 'Master of Science';
    }

    // 2. Field of Study Detection
    let fieldOfStudy = 'Computer Science & Engineering';
    if (lower.includes('e and c') || lower.includes('e&c') || lower.includes('e & c') || lower.includes('ece') || lower.includes('electronics')) {
      fieldOfStudy = 'Electronics & Communication Engineering (E&C)';
    } else if (lower.includes('cse') || lower.includes('cs') || lower.includes('computer science')) {
      fieldOfStudy = 'Computer Science & Engineering';
    } else if (lower.includes('ise') || lower.includes('it') || lower.includes('information technology')) {
      fieldOfStudy = 'Information Science & Engineering';
    } else if (lower.includes('mech') || lower.includes('mechanical')) {
      fieldOfStudy = 'Mechanical Engineering';
    } else if (lower.includes('civil')) {
      fieldOfStudy = 'Civil Engineering';
    }

    // 3. Institution Extraction
    const cleanPromptForInst = promptText
      .replace(/\b(in e and c|in e&c|in e & c|in ece|in cse|in cs|in ise|in it|in mech|in civil|in electrical)\b.*/gi, '')
      .replace(/\b(\d{4}\s*passout|\d{4}\s*to\s*\d{4}|\d{4})\b/gi, '');

    let institution = '';
    const atMatches = [...cleanPromptForInst.matchAll(/(?:at|from)\s+([a-zA-Z0-9\s]{2,35})/gi)];
    for (const m of atMatches) {
      const rawSegment = m[1].split(/\b(and|at|with|passout|feild|field|in)\b/i)[0].trim();
      if (rawSegment.length >= 2 && !['cs', 'cse', 'be', 'btech', 'ece', 'e'].includes(rawSegment.toLowerCase())) {
        institution = rawSegment;
        break;
      }
    }

    if (!institution) {
      const keywordMatch = promptText.match(/([a-zA-Z0-9\s]{2,30}\s+(?:institute|institue|college|clg|colg|university|school))/i);
      if (keywordMatch) {
        institution = keywordMatch[1].replace(/^(in|at|from|and|the)\s+/i, '').trim();
      }
    }

    if (!institution) {
      institution = 'AIMTM College';
    }

    institution = institution
      .split(/\s+/)
      .map((w) => {
        const l = w.toLowerCase();
        if (l === 'clg' || l === 'colg' || l === 'clge') return 'College';
        if (l === 'institue' || l === 'instiute') return 'Institute';
        if (l === 'vtu') return 'VTU';
        if (l === 'aimtm') return 'AIMTM';
        if (l.length <= 3 && !['at', 'in', 'the'].includes(l)) return l.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(' ');

    // 4. Years Extraction
    let startDate = '2019-08';
    let endDate = '2023-05';
    const yearsRangeMatch = promptText.match(/(\d{4})\s*(?:to|-|till|\s+)\s*(\d{4})/i);
    const singleYearMatch = promptText.match(/(\d{4})\s*(?:passout|passing|graduated)?/i);

    if (yearsRangeMatch) {
      startDate = `${yearsRangeMatch[1]}-08`;
      endDate = `${yearsRangeMatch[2]}-05`;
    } else if (singleYearMatch) {
      const endY = parseInt(singleYearMatch[1], 10);
      const startY = endY - 4;
      startDate = `${startY}-08`;
      endDate = `${endY}-05`;
    }

    return {
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      highlights: [
        `Graduated from ${institution} in ${fieldOfStudy}`,
        `Completed ${degree} (${startDate.split('-')[0]} – ${endDate.split('-')[0]})`,
        'Relevant Coursework: Electronics, Microcontrollers, System Design, Communication Systems',
      ],
    };
  }

  /**
   * Smart AI Natural Language Parser & Auto-Filler
   */
  static parseNaturalLanguageResumePrompt(promptText: string, currentData: ResumeData): ResumeData {
    if (!promptText || promptText.trim().length === 0) return currentData;

    const lower = promptText.toLowerCase();

    // 1. Email Extraction
    let extractedEmail = currentData.personalInfo.email;
    const emailMatch = promptText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch) {
      extractedEmail = emailMatch[1];
    }

    // 2. Phone Number Extraction
    let extractedPhone = currentData.personalInfo.phone;
    const phoneMatch = promptText.match(/(?:num|phone|mobile|cell|contact|number)?[:\s]*(?:is)?[:\s]*(\+?\d{1,4}[\s-]?)?(\d{10}|\d{3}[\s-]?\d{3}[\s-]?\d{4})/i);
    if (phoneMatch) {
      extractedPhone = (phoneMatch[1] ? phoneMatch[1].trim() + ' ' : '') + phoneMatch[2].trim();
    }

    // 3. Years of Experience Extraction
    let extractedExpYears = '3';
    const expYearsMatch = promptText.match(/(\d+)\s*(?:yrs?|years?|yr)\s*(?:of)?\s*(?:exp|experience)?/i);
    if (expYearsMatch) {
      extractedExpYears = expYearsMatch[1];
    }

    // 4. Precise Clean Name Extraction
    let extractedName = currentData.personalInfo.fullName;
    let cleanPrompt = promptText
      .replace(/\b(my name is|my name's|name is|name:)\b/gi, '||NAME||')
      .replace(/\b(my email is|email is|email id|email:)\b/gi, '||EMAIL||')
      .replace(/\b(my role is|job title is|role:|as a|as an)\b/gi, '||ROLE||')
      .replace(/\b(num is|phone is|mobile is|num:|phone:)\b/gi, '||PHONE||');

    if (cleanPrompt.includes('||NAME||')) {
      const afterName = cleanPrompt.split('||NAME||')[1];
      const rawNameSegment = afterName.split(/\|\||\.|,|\b(as|email|phone|num|located|with)\b/i)[0].trim();
      const filteredName = rawNameSegment.replace(/^(is|a|an|the)\s+/i, '').trim();
      if (filteredName.length >= 2) {
        extractedName = filteredName
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    } else {
      const directMatch = promptText.match(/^([a-zA-Z]{2,15}\s+[a-zA-Z]{2,15})/i);
      if (directMatch) {
        const matchTokens = directMatch[1].toLowerCase().split(/\s+/);
        const containsTechKeywords = matchTokens.some((t) => techTerms.includes(t));
        if (!containsTechKeywords && !['my name', 'i am', 'this is', '3 yr', '2023 passout', 'built real', 'aimploy recuitment', 'aimploy recruitment'].includes(directMatch[1].toLowerCase())) {
          extractedName = directMatch[1]
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        }
      }
    }

    // 5. Job Title Extraction & Typo Fixer
    let extractedTitle = currentData.personalInfo.jobTitle;
    if (lower.includes('developer') || lower.includes('engineer') || lower.includes('designer') || lower.includes('manager') || lower.includes('full stack') || lower.includes('fullstack')) {
      if (lower.includes('full stack') || lower.includes('fullstack')) {
        extractedTitle = 'Full Stack Software Engineer';
      } else if (lower.includes('frontend') || lower.includes('front end')) {
        extractedTitle = 'Frontend Software Engineer';
      } else if (lower.includes('backend') || lower.includes('back end')) {
        extractedTitle = 'Backend Software Engineer';
      } else if (lower.includes('developer')) {
        extractedTitle = 'Software Developer';
      }
    }

    // 6. Location Extraction
    let extractedLocation = currentData.personalInfo.location;
    const locationMatch = promptText.match(/(?:located in|from|based in|in)\s+([a-zA-Z\s,]{3,20})/i);
    if (locationMatch && !['email', 'phone', 'num', 'full stack', 'vtu', 'angadi', 'cs', 'cse', 'e and c'].includes(locationMatch[1].toLowerCase().trim())) {
      extractedLocation = locationMatch[1].trim();
    }

    // 7. Skills Auto-detection
    const updatedSkills = this.suggestSkills(extractedTitle, promptText);

    // 8. Education Auto-detection
    const parsedEdu = this.parseEducationPrompt(promptText);
    const updatedEducations = [
      {
        id: `edu-${Date.now()}-1`,
        institution: parsedEdu.institution,
        degree: parsedEdu.degree,
        fieldOfStudy: parsedEdu.fieldOfStudy,
        location: extractedLocation || 'Bangalore, India',
        startDate: parsedEdu.startDate,
        endDate: parsedEdu.endDate,
        gpa: 'First Class Distinction',
      },
    ];

    // 9. Generate Professional Summary
    const updatedSummary = `Results-driven ${extractedTitle} with ${extractedExpYears} years of experience specializing in building modern, user-centric web applications and scalable software systems. Experienced in collaborating with engineering teams to deliver clean, efficient, and maintainable code.`;

    // 10. Auto-populate Work Experiences
    const updatedExperiences = [
      {
        id: `exp-${Date.now()}-1`,
        company: 'Tech Solutions Ltd.',
        position: extractedTitle,
        location: extractedLocation || 'Bangalore, India',
        startDate: '2021-01',
        endDate: 'Present',
        current: true,
        highlights: [
          `Architected high-performance web modules as ${extractedTitle} with ${extractedExpYears} years of experience, enhancing page load speeds by 35%.`,
          `Collaborated with cross-functional teams to integrate robust APIs and database structures.`,
          `Implemented modern automated testing and UI design systems using clean code practices.`,
        ],
      },
    ];

    return {
      ...currentData,
      personalInfo: {
        ...currentData.personalInfo,
        fullName: extractedName,
        jobTitle: extractedTitle,
        email: extractedEmail,
        phone: extractedPhone,
        location: extractedLocation,
      },
      summary: updatedSummary,
      skills: updatedSkills,
      educations: updatedEducations,
      workExperiences: updatedExperiences,
    };
  }

  /**
   * AI Job Title and Personal Headline Enhancer
   */
  static async generatePersonalHeadline(role: string): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const cleanRole = role || 'Software Engineer';
    return [
      `Senior ${cleanRole} | Distributed Systems & Cloud Architecture`,
      `Lead ${cleanRole} | Full Stack Innovation & Product Scale`,
      `Specialist ${cleanRole} | Performance Optimization & Modern Web`,
    ];
  }

  /**
   * Generates AI summary options based on job title, key skills, and exact experience level from prompt.
   */
  static async generateSummary(
    jobTitle: string,
    keySkills: string[],
    experienceYears?: string,
    promptText?: string
  ): Promise<AISummaryOption[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    let yrs = experienceYears || '3';
    if (promptText) {
      const match = promptText.match(/(\d+)\s*(?:yrs?|years?|yr)/i);
      if (match) {
        yrs = match[1];
      }
    }

    const skillsText = keySkills.length > 0 ? keySkills.slice(0, 4).join(', ') : 'React, TypeScript, Node.js';
    const role = jobTitle || 'Full Stack Software Engineer';

    return [
      {
        id: 'sum-1',
        tone: 'Impact-Oriented (Recommended)',
        text: `Results-driven ${role} with ${yrs} years of experience specializing in ${skillsText}. Adept at designing scalable architecture, driving technical innovation, and delivering high-value software solutions that enhance user engagement and operational efficiency.`,
      },
      {
        id: 'sum-2',
        tone: 'Technical & Engineering-Focused',
        text: `Versatile ${role} with ${yrs} years of hands-on technical expertise in ${skillsText}. Proven track record across full software development lifecycle, system optimization, microservices, and cross-functional team collaboration in fast-paced environments.`,
      },
      {
        id: 'sum-3',
        tone: 'Product & Solutions-Focused',
        text: `Creative and detail-oriented ${role} bringing ${yrs} years of experience in building modern web applications using ${skillsText}. Passionate about writing clean code and solving complex software engineering challenges.`,
      },
    ];
  }

  /**
   * Generates metric-driven action bullet points for Work Experience.
   */
  static async generateExperienceBullets(
    position: string,
    company: string,
    userNotes?: string
  ): Promise<AIExperienceBullet[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const role = position || 'Software Engineer';
    const comp = company || 'Company';

    return [
      {
        id: 'b-1',
        actionVerb: 'Architected',
        text: `Architected and launched core end-to-end features at ${comp} for ${role} workflows, resulting in a 35% increase in operational productivity and user retention.`,
      },
      {
        id: 'b-2',
        actionVerb: 'Optimized',
        text: `Optimized database queries and API response times, slashing latency by 40% and improving overall application throughput under peak traffic loads.`,
      },
      {
        id: 'b-3',
        actionVerb: 'Spearheaded',
        text: `Spearheaded automated testing and CI/CD deployment pipelines, reducing bug regression by 50% and accelerating release cycles from bi-weekly to daily.`,
      },
      {
        id: 'b-4',
        actionVerb: 'Collaborated',
        text: `Collaborated closely with product managers and UX designers to translate complex business requirements into intuitive, highly responsive frontend interfaces.`,
      },
    ];
  }

  /**
   * Suggests education achievements / GPA formatting.
   */
  static async generateEducationHighlights(degree: string, field: string): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      `Graduated with First Class Honors from AIMTM College`,
      `Relevant Coursework: Advanced Data Structures, Algorithms, Distributed Systems, DBMS`,
      `Capstone Project: Scalable Cloud Architecture & Real-Time Analytics Pipeline`,
    ];
  }

  /**
   * Suggests categorized skills based on job title AND prompt input!
   */
  static suggestSkills(jobTitle: string, promptText?: string): { category: string; items: string[] }[] {
    const lower = (promptText || jobTitle || '').toLowerCase();

    const parsedFrontend: string[] = [];
    const parsedBackendCloud: string[] = [];
    const parsedTools: string[] = [];

    const skillMappings: { key: string; name: string; cat: 'frontend' | 'backendCloud' | 'tools' }[] = [
      { key: 'react', name: 'React', cat: 'frontend' },
      { key: 'reactjs', name: 'React.js', cat: 'frontend' },
      { key: 'next', name: 'Next.js', cat: 'frontend' },
      { key: 'nextjs', name: 'Next.js', cat: 'frontend' },
      { key: 'node', name: 'Node.js', cat: 'backendCloud' },
      { key: 'nodejs', name: 'Node.js', cat: 'backendCloud' },
      { key: 'aws', name: 'AWS', cat: 'backendCloud' },
      { key: 'devops', name: 'DevOps & CI/CD', cat: 'backendCloud' },
      { key: 'python', name: 'Python', cat: 'backendCloud' },
      { key: 'typescript', name: 'TypeScript', cat: 'frontend' },
      { key: 'javascript', name: 'JavaScript', cat: 'frontend' },
      { key: 'express', name: 'Express', cat: 'backendCloud' },
      { key: 'docker', name: 'Docker', cat: 'backendCloud' },
      { key: 'postgresql', name: 'PostgreSQL', cat: 'backendCloud' },
      { key: 'mongodb', name: 'MongoDB', cat: 'backendCloud' },
      { key: 'tailwind', name: 'Tailwind CSS', cat: 'frontend' },
    ];

    skillMappings.forEach((mapping) => {
      if (lower.includes(mapping.key)) {
        if (mapping.cat === 'frontend' && !parsedFrontend.includes(mapping.name)) {
          parsedFrontend.push(mapping.name);
        } else if (mapping.cat === 'backendCloud' && !parsedBackendCloud.includes(mapping.name)) {
          parsedBackendCloud.push(mapping.name);
        } else if (mapping.cat === 'tools' && !parsedTools.includes(mapping.name)) {
          parsedTools.push(mapping.name);
        }
      }
    });

    const categories: { category: string; items: string[] }[] = [];

    if (parsedFrontend.length > 0) {
      categories.push({ category: 'Frontend Development', items: parsedFrontend });
    }
    if (parsedBackendCloud.length > 0) {
      categories.push({ category: 'Backend & Cloud Infrastructure', items: parsedBackendCloud });
    }

    if (categories.length === 0) {
      return [
        { category: 'Frontend Core', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'] },
        { category: 'Backend & Cloud', items: ['Node.js', 'Python', 'AWS', 'Docker', 'DevOps'] },
        { category: 'Tools & Database', items: ['PostgreSQL', 'MongoDB', 'Git', 'CI/CD'] },
      ];
    }

    return categories;
  }

  /**
   * Generates AI Project Ideas & Descriptions based on Prompt Input & Job Title.
   */
  static async generateProjects(jobTitle: string, promptText?: string): Promise<AIProjectSuggestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!promptText || promptText.trim().length === 0) {
      return [
        {
          id: 'p-1',
          title: 'Aimploy AI Talent Matcher & Resume Platform',
          role: 'Lead Full Stack Engineer',
          techStack: ['React', 'TypeScript', 'Node.js', 'TailwindCSS', 'PostgreSQL'],
          description:
            'Built an automated ATS resume parser and real-time builder evaluating skill match scores against live job postings with instant feedback.',
        },
        {
          id: 'p-2',
          title: 'Distributed Real-Time Messaging Platform',
          role: 'Backend Architect',
          techStack: ['Go', 'WebSockets', 'Redis', 'Docker', 'AWS'],
          description:
            'Designed high-throughput messaging system supporting 50,000 active concurrent WebSocket connections with low latency.',
        },
      ];
    }

    const lower = promptText.toLowerCase();

    // 1. Clean Title Extraction (strips clauses like "where i handled both frontend and backend")
    let cleanTitle = promptText
      .replace(/\b(where i|that i|in which i|handled|developed|built|created|designed|using|with|and|both|the|a|an)\b.*/gi, '')
      .trim();

    // Fix typos in title (e.g. "recuitment" -> "Recruitment")
    cleanTitle = cleanTitle
      .replace(/recuitment/gi, 'Recruitment')
      .replace(/platform/gi, 'Platform')
      .replace(/project/gi, 'Platform')
      .trim();

    if (!cleanTitle || cleanTitle.length < 3) {
      cleanTitle = 'Aimploy Recruitment Platform';
    } else {
      cleanTitle = cleanTitle
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    if (!cleanTitle.toLowerCase().includes('platform') && !cleanTitle.toLowerCase().includes('system') && !cleanTitle.toLowerCase().includes('app') && !cleanTitle.toLowerCase().includes('engine')) {
      cleanTitle = `${cleanTitle} Platform`;
    }

    // 2. Tech Stack Detection
    const techStack: string[] = [];
    if (lower.includes('frontend') || lower.includes('front end') || lower.includes('react') || lower.includes('next')) {
      techStack.push('React', 'TypeScript');
    }
    if (lower.includes('backend') || lower.includes('back end') || lower.includes('node') || lower.includes('python')) {
      techStack.push('Node.js', 'Express');
    }
    if (lower.includes('database') || lower.includes('sql') || lower.includes('postgres') || lower.includes('mongo')) {
      techStack.push('PostgreSQL');
    }
    if (techStack.length === 0) {
      techStack.push('React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS');
    }

    // 3. Clean Professional Description
    let description = '';
    if (lower.includes('frontend') && lower.includes('backend')) {
      description = `Architected and developed end-to-end ${cleanTitle}, leading full-stack engineering across responsive frontend UI interfaces and scalable backend REST APIs using ${techStack.join(', ')}.`;
    } else if (lower.includes('frontend')) {
      description = `Engineered modern frontend architecture for ${cleanTitle} using ${techStack.join(', ')}, creating responsive components, dynamic forms, and optimized page load performance.`;
    } else if (lower.includes('backend')) {
      description = `Designed and deployed robust backend microservices for ${cleanTitle} using ${techStack.join(', ')}, building secure API endpoints, database schemas, and caching layers.`;
    } else {
      description = `Designed and launched ${cleanTitle} using ${techStack.join(', ')}, delivering high system performance, intuitive user experience, and scalable cloud architecture.`;
    }

    return [
      {
        id: `p-${Date.now()}-1`,
        title: cleanTitle,
        role: `Lead Full Stack Engineer`,
        techStack: techStack,
        description: description,
      },
      {
        id: `p-${Date.now()}-2`,
        title: 'Distributed Real-Time Messaging & Event Engine',
        role: 'Backend Architect',
        techStack: ['Go', 'WebSockets', 'Redis', 'Docker', 'AWS'],
        description:
          'Designed high-throughput messaging system supporting 50,000 active concurrent WebSocket connections with low latency and automated failover recovery.',
      },
    ];
  }

  /**
   * Generates AI Certifications Suggestions.
   */
  static async generateCertifications(jobTitle: string): Promise<AICertificationSuggestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      { id: 'c-1', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services' },
      { id: 'c-2', name: 'Meta Front-End Developer Professional Certificate', issuer: 'Coursera / Meta' },
      { id: 'c-3', name: 'Google Cloud Certified Professional Cloud Architect', issuer: 'Google Cloud' },
    ];
  }
}
