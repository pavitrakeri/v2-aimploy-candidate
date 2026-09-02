import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Check, ArrowRight, Wand2, GraduationCap, Building2, Calendar, BookOpen, FolderGit2 } from 'lucide-react';
import {
  AIResumeService,
  AISummaryOption,
  AIExperienceBullet,
  AIProjectSuggestion,
  AICertificationSuggestion,
  ParsedEducation,
  initialDefaultResume,
} from '@/services/aiResumeService';
import { PersonalInfo, ResumeData } from '@/types/resume';

export type AIGeneratorType =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications';

interface AIGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: AIGeneratorType;
  currentResumeData?: ResumeData;
  initialRole?: string;
  initialCompany?: string;
  onApplyPersonalInfo?: (personalInfo: Partial<PersonalInfo>) => void;
  onApplySummary?: (text: string) => void;
  onApplyBullets?: (bullets: string[]) => void;
  onApplyEducation?: (parsedEdu: ParsedEducation) => void;
  onApplyEducationHighlights?: (items: string[]) => void;
  onApplySkills?: (categories: { category: string; items: string[] }[]) => void;
  onApplyProjects?: (projects: AIProjectSuggestion[]) => void;
  onApplyCertifications?: (certifications: AICertificationSuggestion[]) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  open,
  onOpenChange,
  type,
  currentResumeData,
  initialRole,
  initialCompany = '',
  onApplyPersonalInfo,
  onApplySummary,
  onApplyBullets,
  onApplyEducation,
  onApplyEducationHighlights,
  onApplySkills,
  onApplyProjects,
  onApplyCertifications,
}) => {
  const activeData = currentResumeData || initialDefaultResume;

  const [singlePrompt, setSinglePrompt] = useState('');
  const [candidateName, setCandidateName] = useState(activeData.personalInfo.fullName || 'Pavitra Keri');
  const [jobTitle, setJobTitle] = useState(initialRole || activeData.personalInfo.jobTitle || 'Full Stack Software Engineer');
  const [detectedEmail, setDetectedEmail] = useState(activeData.personalInfo.email || 'pavitrams7899@gmail.com');
  const [detectedPhone, setDetectedPhone] = useState(activeData.personalInfo.phone || '8431927245');
  const [company, setCompany] = useState(initialCompany);
  const [loading, setLoading] = useState(false);

  // States for Total Personal Section AI Bundles
  const [personalBundles, setPersonalBundles] = useState<Partial<PersonalInfo>[]>([]);
  const [selectedPersonalBundle, setSelectedPersonalBundle] = useState<Partial<PersonalInfo> | null>(null);

  const [summaryResults, setSummaryResults] = useState<AISummaryOption[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<string>('');

  const [bulletResults, setBulletResults] = useState<AIExperienceBullet[]>([]);
  const [selectedBullets, setSelectedBullets] = useState<string[]>([]);

  const [parsedEduResult, setParsedEduResult] = useState<ParsedEducation>(
    AIResumeService.parseEducationPrompt('BE in CSE at VTU University and at 2019 to 2023 passout')
  );

  const [skillResults, setSkillResults] = useState<{ category: string; items: string[] }[]>([]);

  const [projectResults, setProjectResults] = useState<AIProjectSuggestion[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<AIProjectSuggestion[]>([]);

  const [certResults, setCertResults] = useState<AICertificationSuggestion[]>([]);

  // Reset prompt to empty when opening modal & initialize project options
  useEffect(() => {
    if (open) {
      setSinglePrompt('');
      if (currentResumeData) {
        setCandidateName(currentResumeData.personalInfo.fullName || 'Pavitra Keri');
        setJobTitle(currentResumeData.personalInfo.jobTitle || 'Full Stack Software Engineer');
        setDetectedEmail(currentResumeData.personalInfo.email || 'pavitrams7899@gmail.com');
        setDetectedPhone(currentResumeData.personalInfo.phone || '8431927245');

        if (type === 'skills') {
          const skills = AIResumeService.suggestSkills(
            currentResumeData.personalInfo.jobTitle,
            'reactjs nodejs nextjs aws devops python'
          );
          setSkillResults(skills);
        } else if (type === 'education') {
          const edu = AIResumeService.parseEducationPrompt('BE in CSE at VTU University and at 2019 to 2023 passout');
          setParsedEduResult(edu);
        } else if (type === 'projects') {
          AIResumeService.generateProjects(currentResumeData.personalInfo.jobTitle, '').then((projs) => {
            setProjectResults(projs);
            if (projs.length > 0) setSelectedProjects([projs[0]]);
          });
        }
      }
    }
  }, [open, currentResumeData, type]);

  const handlePromptChange = (val: string) => {
    setSinglePrompt(val);
    if (val.trim().length > 1) {
      const parsed = AIResumeService.parseNaturalLanguageResumePrompt(val, activeData);
      if (parsed.personalInfo.fullName) setCandidateName(parsed.personalInfo.fullName);
      if (parsed.personalInfo.jobTitle) setJobTitle(parsed.personalInfo.jobTitle);
      if (parsed.personalInfo.email) setDetectedEmail(parsed.personalInfo.email);
      if (parsed.personalInfo.phone) setDetectedPhone(parsed.personalInfo.phone);

      if (type === 'skills') {
        const skills = AIResumeService.suggestSkills(jobTitle, val);
        setSkillResults(skills);
      } else if (type === 'education') {
        const edu = AIResumeService.parseEducationPrompt(val);
        setParsedEduResult(edu);
      } else if (type === 'projects') {
        AIResumeService.generateProjects(jobTitle, val).then((projs) => {
          setProjectResults(projs);
          if (projs.length > 0) setSelectedProjects([projs[0]]);
        });
      }
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const promptToUse =
        singlePrompt.trim() ||
        (type === 'education'
          ? 'BE in CSE at VTU University and at 2019 to 2023 passout'
          : type === 'skills'
          ? 'reactjs nodejs nextjs aws devops python'
          : type === 'projects'
          ? 'built real-time messaging app with WebSockets, Go, Redis'
          : '3 yr of exp in full stack development');

      const parsed = AIResumeService.parseNaturalLanguageResumePrompt(promptToUse, activeData);

      const cleanName = parsed.personalInfo.fullName || candidateName || 'Pavitra Keri';
      const cleanRole = parsed.personalInfo.jobTitle || jobTitle || 'Full Stack Software Engineer';
      const cleanEmail = parsed.personalInfo.email || detectedEmail || 'pavitrams7899@gmail.com';
      const cleanPhone = parsed.personalInfo.phone || detectedPhone || '8431927245';
      const cleanLocation = parsed.personalInfo.location || 'Bangalore, India';

      // Attempt OpenAI API via Aimploy_dev Backend
      const aiData = await AIResumeService.fetchOpenAIResumeSection(type, promptToUse, cleanName, cleanRole);
      if (aiData) {
        if (type === 'summary' && typeof aiData === 'string') {
          setSelectedSummary(aiData);
          setSummaryResults([{ id: 'openai-1', tone: 'OpenAI GPT-4o Generated', text: aiData }]);
        } else if (type === 'summary' && aiData.summary) {
          setSelectedSummary(aiData.summary);
          setSummaryResults([{ id: 'openai-1', tone: 'OpenAI GPT-4o Generated', text: aiData.summary }]);
        }
      }

      if (type === 'personal') {
        const bundles: Partial<PersonalInfo>[] = [
          {
            fullName: cleanName,
            jobTitle: `Senior ${cleanRole}`,
            email: cleanEmail,
            phone: cleanPhone,
            location: cleanLocation,
            linkedin: `linkedin.com/in/${cleanName.toLowerCase().replace(/\s+/g, '')}`,
            github: `github.com/${cleanName.toLowerCase().replace(/\s+/g, '')}`,
          },
          {
            fullName: cleanName,
            jobTitle: `Lead ${cleanRole} Architect`,
            email: cleanEmail,
            phone: cleanPhone,
            location: cleanLocation,
            linkedin: `linkedin.com/in/${cleanName.toLowerCase().replace(/\s+/g, '')}-lead`,
            github: `github.com/${cleanName.toLowerCase().replace(/\s+/g, '')}-tech`,
          },
        ];
        setPersonalBundles(bundles);
        if (bundles.length > 0) setSelectedPersonalBundle(bundles[0]);
      } else if (type === 'summary') {
        const options = await AIResumeService.generateSummary(cleanRole, ['React', 'TypeScript', 'Node.js'], undefined, promptToUse);
        setSummaryResults(options);
        if (options.length > 0) setSelectedSummary(options[0].text);
      } else if (type === 'experience') {
        const bullets = await AIResumeService.generateExperienceBullets(cleanRole, company || 'Innovate Tech');
        setBulletResults(bullets);
        setSelectedBullets(bullets.map((b) => b.text));
      } else if (type === 'education') {
        const edu = AIResumeService.parseEducationPrompt(promptToUse);
        setParsedEduResult(edu);
      } else if (type === 'skills') {
        const skills = AIResumeService.suggestSkills(cleanRole, promptToUse);
        setSkillResults(skills);
      } else if (type === 'projects') {
        const projs = await AIResumeService.generateProjects(cleanRole, promptToUse);
        setProjectResults(projs);
        if (projs.length > 0) setSelectedProjects(projs);
      } else if (type === 'certifications') {
        const certs = await AIResumeService.generateCertifications(cleanRole);
        setCertResults(certs);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const promptToUse =
      singlePrompt.trim() ||
      (type === 'education'
        ? 'BE in CSE at VTU University and at 2019 to 2023 passout'
        : type === 'skills'
        ? 'reactjs nodejs nextjs aws devops python'
        : type === 'projects'
        ? 'built real-time messaging app with WebSockets, Go, Redis'
        : '3 yr of exp in full stack development');

    if (type === 'personal' && selectedPersonalBundle && onApplyPersonalInfo) {
      onApplyPersonalInfo(selectedPersonalBundle);
    } else if (type === 'summary' && selectedSummary && onApplySummary) {
      onApplySummary(selectedSummary);
    } else if (type === 'experience' && selectedBullets.length > 0 && onApplyBullets) {
      onApplyBullets(selectedBullets);
    } else if (type === 'education') {
      const edu = AIResumeService.parseEducationPrompt(promptToUse);
      if (onApplyEducation) {
        onApplyEducation(edu);
      } else if (onApplyEducationHighlights) {
        onApplyEducationHighlights(edu.highlights);
      }
    } else if (type === 'skills' && onApplySkills) {
      const suggested = skillResults.length > 0 ? skillResults : AIResumeService.suggestSkills(jobTitle, promptToUse);
      onApplySkills(suggested);
    } else if (type === 'projects' && onApplyProjects) {
      const toApply = selectedProjects.length > 0 ? selectedProjects : projectResults;
      onApplyProjects(toApply);
    } else if (type === 'certifications' && certResults.length > 0 && onApplyCertifications) {
      onApplyCertifications(certResults);
    }
    onOpenChange(false);
  };

  const getPlaceholderText = () => {
    if (type === 'personal') return 'e.g. Pavitra Keri as Software Developer EMAIL ID pavitrams7899@gmail.com num is 8431927245';
    if (type === 'education') return 'e.g. BE in CSE at VTU University and at 2019 to 2023 passout';
    if (type === 'skills') return 'e.g. reactjs nodejs nextjs aws devops python';
    if (type === 'projects') return 'e.g. built real-time messaging app with WebSockets, Go, Redis';
    if (type === 'experience') return 'e.g. 3 yr of exp in full stack development';
    if (type === 'summary') return 'e.g. 3 yr of exp in full stack development with React & Node';
    return 'Type or paste natural language details...';
  };

  const currentSkillsPreview = skillResults.length > 0 ? skillResults : AIResumeService.suggestSkills(jobTitle, singlePrompt || 'reactjs nodejs nextjs aws devops python');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles size={20} />
            </div>
            AI {type.toUpperCase()} SECTION ASSISTANT
          </DialogTitle>
          <DialogDescription className="text-sm">
            Enter your prompt or details below to auto-fill the total {type} section.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* ONE SINGLE SMART AI PROMPT INPUT BOX */}
          <div className="p-3 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-2">
            <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Sparkles size={14} /> AI Natural Language Prompt Box
            </Label>
            <Input
              value={singlePrompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder={getPlaceholderText()}
              className="text-xs bg-background border-primary/40 font-medium placeholder:text-muted-foreground/60"
            />
            {/* Show Candidate Info bar ONLY for Personal Info section */}
            {type === 'personal' && (
              <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 pt-1">
                <span>Name: <strong className="text-foreground">{candidateName}</strong></span>
                <span>Role: <strong className="text-foreground">{jobTitle}</strong></span>
                <span>Email: <strong className="text-foreground">{detectedEmail}</strong></span>
                <span>Phone: <strong className="text-foreground">{detectedPhone}</strong></span>
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-[#9000FF] hover:bg-[#7b00da] text-white font-medium flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating Total {type.toUpperCase()} Section...
              </>
            ) : (
              <>
                <Wand2 size={16} /> Auto-Generate Total {type.toUpperCase()} Section
              </>
            )}
          </Button>

          {/* Total Personal Section AI Bundles */}
          {type === 'personal' && personalBundles.length > 0 && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Generated Total Personal Section Profile:
              </Label>
              {personalBundles.map((bundle, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPersonalBundle(bundle)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-1 ${
                    selectedPersonalBundle === bundle
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{bundle.fullName}</span>
                    {selectedPersonalBundle === bundle && (
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <Check size={14} /> Selected
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-primary">{bundle.jobTitle}</div>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1 pt-1">
                    <div>📧 {bundle.email}</div>
                    <div>📞 {bundle.phone}</div>
                    <div>📍 {bundle.location}</div>
                    <div>🔗 {bundle.linkedin}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Type 2: Summary */}
          {type === 'summary' && summaryResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select AI Generated Summary:
              </Label>
              {summaryResults.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedSummary(opt.text)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedSummary === opt.text
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className="text-xs font-medium bg-background">
                      {opt.tone}
                    </Badge>
                    {selectedSummary === opt.text && (
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <Check size={14} /> Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-foreground">{opt.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Type 3: Experience */}
          {type === 'experience' && bulletResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Generated Action Bullet Points:
              </Label>
              {bulletResults.map((bullet) => {
                const isChecked = selectedBullets.includes(bullet.text);
                return (
                  <div
                    key={bullet.id}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedBullets(selectedBullets.filter((b) => b !== bullet.text));
                      } else {
                        setSelectedBullets([...selectedBullets, bullet.text]);
                      }
                    }}
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-all ${
                      isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center ${
                        isChecked ? 'bg-primary border-primary text-white' : 'border-muted-foreground'
                      }`}
                    >
                      {isChecked && <Check size={12} />}
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="text-[10px] mb-1 font-semibold">
                        {bullet.actionVerb}
                      </Badge>
                      <p className="text-xs leading-relaxed text-foreground">{bullet.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Type 4: Education */}
          {type === 'education' && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Extracted Education Details:
              </Label>
              <div className="p-4 rounded-xl border-2 border-primary/40 bg-primary/5 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-primary text-sm">
                  <GraduationCap size={18} />
                  <span>{parsedEduResult.degree}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-primary shrink-0" />
                    <span>Field: <strong className="text-foreground">{parsedEduResult.fieldOfStudy}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-primary shrink-0" />
                    <span>University: <strong className="text-foreground">{parsedEduResult.institution}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary shrink-0" />
                    <span>Duration: <strong className="text-foreground">{parsedEduResult.startDate.split('-')[0]} – {parsedEduResult.endDate.split('-')[0]}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Type 5: Skills */}
          {type === 'skills' && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Extracted Skill Categories & Items:
              </Label>
              <div className="space-y-2.5">
                {currentSkillsPreview.map((cat, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                    <div className="font-bold text-xs text-primary flex items-center gap-1.5">
                      <Sparkles size={14} /> {cat.category}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item, i) => (
                        <Badge key={i} className="bg-primary text-white text-xs px-2.5 py-1 font-medium">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type 6: Projects */}
          {type === 'projects' && projectResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Generated Project Portfolio Ideas:
              </Label>
              {projectResults.map((p) => {
                const isSelected = selectedProjects.some((sp) => sp.id === p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedProjects(selectedProjects.filter((sp) => sp.id !== p.id));
                      } else {
                        setSelectedProjects([...selectedProjects, p]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderGit2 size={16} className="text-primary" />
                        <span className="font-bold text-xs text-primary">{p.title}</span>
                      </div>
                      {isSelected && (
                        <Badge className="bg-primary text-white text-[10px] gap-1">
                          <Check size={12} /> Selected
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] font-semibold text-foreground">{p.role}</div>
                    <div className="flex flex-wrap gap-1">
                      {p.techStack.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-background">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Type 7: Certifications */}
          {type === 'certifications' && certResults.length > 0 && (
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold">Top Recommended Certifications:</Label>
              {certResults.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-border bg-card text-xs">
                  <div className="font-bold text-foreground">{c.name}</div>
                  <div className="text-muted-foreground">{c.issuer}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} className="bg-[#9000FF] hover:bg-[#7b00da] text-white">
            Apply Total {type.toUpperCase()} Section <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
