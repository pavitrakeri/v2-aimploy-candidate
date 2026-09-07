export type ResumeTemplateId = 'modern' | 'executive' | 'tech' | 'creative' | 'corporate' | 'compact' | 'minimal' | 'startup' | 'timeline' | 'academic' | 'flowcv';

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  link?: string;
  techStack: string[];
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ResumeData {
  id: string;
  title: string;
  templateId: ResumeTemplateId;
  personalInfo: PersonalInfo;
  summary: string;
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: SkillCategory[];
  projects: Project[];
  certifications: Certification[];
}
