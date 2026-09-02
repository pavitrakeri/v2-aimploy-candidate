import React, { useState } from 'react';
import { ResumeData, WorkExperience, Education, SkillCategory, Project, Certification } from '@/types/resume';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Plus, Trash2, User, Briefcase, GraduationCap, Code2, FolderGit2, Award, Wand2, Check } from 'lucide-react';
import { AIGeneratorModal, AIGeneratorType } from './AIGeneratorModal';
import { AIResumeService } from '@/services/aiResumeService';
import { toast } from 'sonner';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalType, setAiModalType] = useState<AIGeneratorType>('summary');
  const [activeExpId, setActiveExpId] = useState<string | null>(null);

  // Section-specific natural language AI quick prompt inputs
  const [personalAiPrompt, setPersonalAiPrompt] = useState('');

  const handlePersonalAiTyping = (text: string) => {
    setPersonalAiPrompt(text);
    if (text.trim().length > 3) {
      const parsed = AIResumeService.parseNaturalLanguageResumePrompt(text, data);
      onChange(parsed);
    }
  };

  // Helper updates
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  const handleSummaryChange = (summaryText: string) => {
    onChange({
      ...data,
      summary: summaryText,
    });
  };

  // Work Experience Handlers
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      highlights: [''],
    };
    onChange({
      ...data,
      workExperiences: [...data.workExperiences, newExp],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      workExperiences: data.workExperiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      workExperiences: data.workExperiences.filter((exp) => exp.id !== id),
    });
  };

  // Education Handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
    };
    onChange({
      ...data,
      educations: [...data.educations, newEdu],
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      educations: data.educations.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      educations: data.educations.filter((edu) => edu.id !== id),
    });
  };

  // Project Handlers
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: '',
      role: '',
      techStack: [],
      description: '',
    };
    onChange({
      ...data,
      projects: [...(data.projects || []), newProj],
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: (data.projects || []).filter((p) => p.id !== id),
    });
  };

  // Certification Handlers
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issueDate: '',
    };
    onChange({
      ...data,
      certifications: [...(data.certifications || []), newCert],
    });
  };

  const removeCertification = (id: string) => {
    onChange({
      ...data,
      certifications: (data.certifications || []).filter((c) => c.id !== id),
    });
  };

  const [magicPrompt, setMagicPrompt] = useState('');

  const handleMagicFillClick = () => {
    if (!magicPrompt.trim()) {
      toast.error('Please enter a description or prompt for AI auto-fill!');
      return;
    }
    const updated = AIResumeService.parseNaturalLanguageResumePrompt(magicPrompt, data);
    onChange(updated);
    toast.success('AI successfully extracted & auto-filled your resume sections!');
  };

  const handleSamplePromptClick = (promptText: string) => {
    setMagicPrompt(promptText);
    const updated = AIResumeService.parseNaturalLanguageResumePrompt(promptText, data);
    onChange(updated);
    toast.success('Applied sample prompt to your resume sections!');
  };

  const totalSkillsCount = data.skills.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="space-y-4">
      {/* AI Natural Language Quick Fill Card */}
      <div className="bg-gradient-to-r from-purple-950/20 via-indigo-950/20 to-slate-900/20 border border-purple-500/30 p-3.5 rounded-xl shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 size={16} className="text-purple-500 animate-pulse" />
            <span className="text-xs font-bold text-foreground">AI Resume Natural Language Assistant</span>
          </div>
          <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/20">
            Smart Auto-Parser
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            value={magicPrompt}
            onChange={(e) => {
              setMagicPrompt(e.target.value);
              if (e.target.value.trim().length > 8) {
                const parsed = AIResumeService.parseNaturalLanguageResumePrompt(e.target.value, data);
                onChange(parsed);
              }
            }}
            placeholder="e.g. Senior Frontend Dev with 4 yrs experience, skilled in React, TypeScript, Node.js. Studied at VTU..."
            className="text-xs h-9 bg-background/90 border-purple-500/20"
          />
          <Button
            size="sm"
            onClick={handleMagicFillClick}
            className="bg-[#9000FF] hover:bg-[#7b00da] text-white text-xs gap-1.5 shrink-0 h-9 font-semibold shadow-md"
          >
            <Sparkles size={14} /> Magic Fill
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-muted-foreground font-medium">Quick Prompts:</span>
          <button
            type="button"
            onClick={() => handleSamplePromptClick('Senior Full Stack Engineer at TechCorp for 3 yrs, skilled in React, TypeScript, Node.js, and AWS')}
            className="text-[10px] bg-muted/80 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 px-2 py-0.5 rounded border border-border transition-colors"
          >
            💻 Full Stack Dev
          </button>
          <button
            type="button"
            onClick={() => handleSamplePromptClick('Lead Product Manager with 5 yrs driving product strategy, agile, UX research, and growth metrics')}
            className="text-[10px] bg-muted/80 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 px-2 py-0.5 rounded border border-border transition-colors"
          >
            📈 Product Manager
          </button>
          <button
            type="button"
            onClick={() => handleSamplePromptClick('Data Scientist experienced in Python, TensorFlow, SQL, ML models, and predictive analytics')}
            className="text-[10px] bg-muted/80 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 px-2 py-0.5 rounded border border-border transition-colors"
          >
            🤖 Data Scientist
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 no-scrollbar">
          <TabsList className="flex w-full bg-muted/80 p-1.5 rounded-xl gap-1 min-w-max">
            <TabsTrigger value="personal" className="text-xs px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
              <User size={13} className="text-primary" /> Personal
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-xs px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
              <Sparkles size={13} className="text-yellow-500" /> Summary
            </TabsTrigger>
            <TabsTrigger value="experience" className="text-xs px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
              <Briefcase size={13} className="text-blue-500" /> Work ({data.workExperiences.length})
            </TabsTrigger>
            <TabsTrigger value="education" className="text-xs px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
              <GraduationCap size={13} className="text-emerald-500" /> Edu ({data.educations.length})
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
              <Code2 size={13} className="text-purple-500" /> Skills ({totalSkillsCount})
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-xs px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
              <FolderGit2 size={13} className="text-orange-500" /> Projects ({(data.projects || []).length})
            </TabsTrigger>
            <TabsTrigger value="certs" className="text-xs px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
              <Award size={13} className="text-indigo-500" /> Certs ({(data.certifications || []).length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Personal Information */}
        <TabsContent value="personal" className="pt-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Personal Info & Contact</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAiModalType('personal');
                  setAiModalOpen(true);
                }}
                className="text-xs border-primary/40 text-primary hover:bg-primary/10 gap-1.5 font-semibold"
              >
                <Sparkles size={14} /> AI Personal Section Input
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input
                    value={data.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    placeholder="e.g. Pavitra Keri"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Job Title / Role</Label>
                  <Input
                    value={data.personalInfo.jobTitle}
                    onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Email Address</Label>
                  <Input
                    value={data.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    placeholder="pavitrams7899@gmail.com"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Phone Number</Label>
                  <Input
                    value={data.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Location</Label>
                  <Input
                    value={data.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">LinkedIn Profile</Label>
                  <Input
                    value={data.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/alexmorgan"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Professional Summary */}
        <TabsContent value="summary" className="pt-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Professional Summary</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAiModalType('summary');
                  setAiModalOpen(true);
                }}
                className="text-xs border-primary/40 text-primary hover:bg-primary/10 gap-1.5 font-semibold"
              >
                <Sparkles size={14} /> AI Summary Section Input
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={5}
                value={data.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                placeholder="Write a brief professional summary..."
                className="text-xs leading-relaxed"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Work Experience */}
        <TabsContent value="experience" className="pt-3">
          <div className="space-y-4">
            {data.workExperiences.map((exp, index) => (
              <Card key={exp.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold text-foreground">
                    Experience #{index + 1}: {exp.position || 'Position'} {exp.company ? `@ ${exp.company}` : ''}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setActiveExpId(exp.id);
                        setAiModalType('experience');
                        setAiModalOpen(true);
                      }}
                      className="text-[11px] text-primary hover:bg-primary/10 h-7 px-2 gap-1 font-semibold"
                    >
                      <Sparkles size={12} /> AI Experience Section Input
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeExperience(exp.id)}
                      className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-xs">Job Title / Role</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        placeholder="e.g. Senior Developer"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Company Name</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Start Date</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        placeholder="2021-01"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Date</Label>
                      <Input
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        placeholder="Present"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-1 block">Key Highlights (One per line)</Label>
                    <Textarea
                      rows={3}
                      value={exp.highlights.join('\n')}
                      onChange={(e) =>
                        updateExperience(exp.id, 'highlights', e.target.value.split('\n'))
                      }
                      placeholder="Bullet point 1&#10;Bullet point 2"
                      className="text-xs leading-relaxed"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={addExperience}
              variant="outline"
              className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5 text-xs py-2 gap-1.5"
            >
              <Plus size={14} /> Add Experience
            </Button>
          </div>
        </TabsContent>

        {/* 4. Education */}
        <TabsContent value="education" className="pt-3">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAiModalType('education');
                  setAiModalOpen(true);
                }}
                className="text-xs border-primary/40 text-primary hover:bg-primary/10 gap-1.5 font-semibold"
              >
                <Sparkles size={14} /> AI Education Section Input
              </Button>
            </div>

            {data.educations.map((edu, index) => (
              <Card key={edu.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold">
                    Education #{index + 1}: {edu.degree || 'Degree'}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeEducation(edu.id)}
                    className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <Label className="text-xs">Institution / University</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      placeholder="UC Berkeley"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Degree & Field</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      placeholder="B.S. Computer Science"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Graduation Year</Label>
                    <Input
                      value={edu.endDate}
                      onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                      placeholder="2019"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">GPA / Honors</Label>
                    <Input
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      placeholder="3.8 / 4.0"
                      className="mt-1 text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={addEducation}
              variant="outline"
              className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5 text-xs py-2 gap-1.5"
            >
              <Plus size={14} /> Add Education
            </Button>
          </div>
        </TabsContent>

        {/* 5. Skills */}
        <TabsContent value="skills" className="pt-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Skills & Categories</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAiModalType('skills');
                  setAiModalOpen(true);
                }}
                className="text-xs border-primary/40 text-primary hover:bg-primary/10 gap-1.5 font-semibold"
              >
                <Sparkles size={14} /> AI Skills Section Input
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.skills.map((group, groupIdx) => (
                <div key={groupIdx} className="p-3 border rounded-lg bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      value={group.category}
                      onChange={(e) => {
                        const updated = [...data.skills];
                        updated[groupIdx].category = e.target.value;
                        onChange({ ...data, skills: updated });
                      }}
                      placeholder="Category (e.g. Frontend)"
                      className="text-xs font-semibold max-w-[200px]"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const updated = data.skills.filter((_, i) => i !== groupIdx);
                        onChange({ ...data, skills: updated });
                      }}
                      className="text-destructive h-7 w-7 p-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <Input
                    value={group.items.join(', ')}
                    onChange={(e) => {
                      const updated = [...data.skills];
                      updated[groupIdx].items = e.target.value.split(',').map((s) => s.trim());
                      onChange({ ...data, skills: updated });
                    }}
                    placeholder="Skills separated by commas"
                    className="text-xs"
                  />
                </div>
              ))}

              <Button
                onClick={() => {
                  onChange({
                    ...data,
                    skills: [...data.skills, { category: 'New Skill Category', items: ['Skill 1', 'Skill 2'] }],
                  });
                }}
                variant="outline"
                className="w-full text-xs gap-1.5 border-dashed"
              >
                <Plus size={14} /> Add Skill Category
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Projects */}
        <TabsContent value="projects" className="pt-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Projects Portfolio</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAiModalType('projects');
                  setAiModalOpen(true);
                }}
                className="text-xs border-primary/40 text-primary hover:bg-primary/10 gap-1.5 font-semibold"
              >
                <Sparkles size={14} /> AI Projects Section Input
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(data.projects || []).map((proj, pIdx) => (
                <div key={proj.id} className="p-3 border rounded-lg bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold">Project #{pIdx + 1}</h5>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeProject(proj.id)}
                      className="text-destructive h-7 w-7 p-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-xs">Project Title</Label>
                      <Input
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...(data.projects || [])];
                          updated[pIdx].title = e.target.value;
                          onChange({ ...data, projects: updated });
                        }}
                        placeholder="Aimploy AI Matcher"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Role</Label>
                      <Input
                        value={proj.role}
                        onChange={(e) => {
                          const updated = [...(data.projects || [])];
                          updated[pIdx].role = e.target.value;
                          onChange({ ...data, projects: updated });
                        }}
                        placeholder="Lead Developer"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...(data.projects || [])];
                        updated[pIdx].description = e.target.value;
                        onChange({ ...data, projects: updated });
                      }}
                      placeholder="Brief overview of project and tech stack..."
                      className="text-xs mt-1"
                    />
                  </div>
                </div>
              ))}

              <Button
                onClick={addProject}
                variant="outline"
                className="w-full text-xs gap-1.5 border-dashed"
              >
                <Plus size={14} /> Add Project
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. Certifications */}
        <TabsContent value="certs" className="pt-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Certifications & Licenses</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAiModalType('certifications');
                  setAiModalOpen(true);
                }}
                className="text-xs border-primary/40 text-primary hover:bg-primary/10 gap-1.5 font-semibold"
              >
                <Sparkles size={14} /> AI Certifications Section Input
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(data.certifications || []).map((cert, cIdx) => (
                <div key={cert.id} className="p-3 border rounded-lg bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold">Cert #{cIdx + 1}</h5>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCertification(cert.id)}
                      className="text-destructive h-7 w-7 p-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-xs">Certification Name</Label>
                      <Input
                        value={cert.name}
                        onChange={(e) => {
                          const updated = [...(data.certifications || [])];
                          updated[cIdx].name = e.target.value;
                          onChange({ ...data, certifications: updated });
                        }}
                        placeholder="AWS Solutions Architect"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Issuer</Label>
                      <Input
                        value={cert.issuer}
                        onChange={(e) => {
                          const updated = [...(data.certifications || [])];
                          updated[cIdx].issuer = e.target.value;
                          onChange({ ...data, certifications: updated });
                        }}
                        placeholder="Amazon Web Services"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={addCertification}
                variant="outline"
                className="w-full text-xs gap-1.5 border-dashed"
              >
                <Plus size={14} /> Add Certification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Generator Modal */}
      <AIGeneratorModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        type={aiModalType}
        currentResumeData={data}
        initialRole={data.personalInfo.jobTitle}
        onApplyPersonalInfo={(personalBundle) => {
          onChange({
            ...data,
            personalInfo: {
              ...data.personalInfo,
              ...personalBundle,
            },
          });
        }}
        onApplySummary={handleSummaryChange}
        onApplyBullets={(bullets) => {
          if (activeExpId) {
            updateExperience(activeExpId, 'highlights', bullets);
          }
        }}
        onApplyEducation={(parsedEdu) => {
          const updatedEdu = [
            {
              id: data.educations[0]?.id || `edu-${Date.now()}`,
              institution: parsedEdu.institution,
              degree: parsedEdu.degree,
              fieldOfStudy: parsedEdu.fieldOfStudy,
              location: data.personalInfo.location || 'Bangalore, India',
              startDate: parsedEdu.startDate,
              endDate: parsedEdu.endDate,
              gpa: 'First Class Distinction',
            },
            ...data.educations.slice(1),
          ];
          onChange({
            ...data,
            educations: updatedEdu,
          });
        }}
        onApplyEducationHighlights={(highlights) => {
          if (data.educations.length > 0) {
            updateEducation(data.educations[0].id, 'gpa', highlights.join(' | '));
          }
        }}
        onApplySkills={(suggestedCategories) => {
          onChange({
            ...data,
            skills: suggestedCategories,
          });
        }}
        onApplyProjects={(suggestedProjects) => {
          onChange({
            ...data,
            projects: suggestedProjects,
          });
        }}
        onApplyCertifications={(suggestedCerts) => {
          onChange({
            ...data,
            certifications: suggestedCerts.map((c) => ({
              id: c.id,
              name: c.name,
              issuer: c.issuer,
              issueDate: '2023',
            })),
          });
        }}
      />
    </div>
  );
};
