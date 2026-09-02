import React from 'react';
import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin, Globe, Github, ExternalLink, FolderGit2 } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, scale = 1 }) => {
  const { personalInfo, summary, workExperiences, educations, skills, projects, certifications, templateId } =
    data;

  const renderTemplateContent = () => {
    if (templateId === 'executive') {
      return (
        <div className="w-full bg-white text-slate-900 font-serif p-8 shadow-lg min-h-[1050px] print:shadow-none print:p-0 select-text">
          {/* Executive Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-5 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <p className="text-sm font-sans font-medium text-slate-600 tracking-widest uppercase mt-1">
              {personalInfo.jobTitle || 'Professional Title'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-xs font-sans text-slate-700">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>• {personalInfo.phone}</span>}
              {personalInfo.location && <span>• {personalInfo.location}</span>}
              {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
              {personalInfo.portfolio && <span>• {personalInfo.portfolio}</span>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="mb-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-xs font-sans leading-relaxed text-slate-800">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {workExperiences.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-3">
                Work Experience
              </h2>
              <div className="space-y-4">
                {workExperiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline font-sans">
                      <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                      <span className="text-[11px] text-slate-600 italic">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-sans italic text-slate-700 mb-1">
                      <span>{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    {exp.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 text-xs font-sans space-y-1 text-slate-800">
                        {exp.highlights.map((h, idx) => (
                          <li key={idx} className="leading-tight">{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Key Projects & Portfolio
              </h2>
              <div className="space-y-3 font-sans text-xs">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{proj.title} {proj.role ? `(${proj.role})` : ''}</span>
                      {proj.link && <span className="text-[10px] text-slate-600 font-normal italic">{proj.link}</span>}
                    </div>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="text-[11px] text-slate-600 italic mb-0.5">Technologies: {proj.techStack.join(', ')}</div>
                    )}
                    <p className="text-slate-800 leading-tight">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {educations.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Education
              </h2>
              <div className="space-y-2">
                {educations.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline font-sans text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                      <div className="text-[11px] text-slate-700">{edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}</div>
                    </div>
                    <span className="text-[11px] text-slate-600 italic">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Skills & Expertise
              </h2>
              <div className="space-y-1.5 font-sans text-xs">
                {skills.map((group, idx) => (
                  <div key={idx}>
                    <span className="font-bold text-slate-900">{group.category}: </span>
                    <span className="text-slate-800">{group.items.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (templateId === 'tech') {
      return (
        <div className="w-full bg-slate-950 text-slate-100 font-mono p-8 shadow-lg min-h-[1050px] print:shadow-none print:p-0 select-text">
          {/* Tech Header */}
          <div className="border-b border-cyan-500/30 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">
                  {personalInfo.fullName || 'Your Name'}
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {personalInfo.jobTitle || 'Software Engineer'}
                </p>
              </div>
              <div className="text-right text-[11px] font-sans text-slate-400 space-y-0.5">
                {personalInfo.email && <div>{personalInfo.email}</div>}
                {personalInfo.phone && <div>{personalInfo.phone}</div>}
                {personalInfo.location && <div>{personalInfo.location}</div>}
                {personalInfo.github && <div className="text-cyan-400">{personalInfo.github}</div>}
              </div>
            </div>
          </div>

          {/* Tech Summary */}
          {summary && (
            <div className="mb-6 bg-slate-900/60 p-3.5 rounded border border-slate-800 font-sans text-xs leading-relaxed text-slate-300">
              {summary}
            </div>
          )}

          {/* Skills Grid */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>//</span> TECHNICAL_SKILLS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
                {skills.map((group, idx) => (
                  <div key={idx} className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">{group.category}</span>
                    <div className="flex flex-wrap gap-1">
                      {group.items.map((item, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[10px]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="mb-6 font-sans">
              <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>//</span> FEATURED_PROJECTS
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-slate-900/40 p-3 rounded border border-slate-800">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-100">{proj.title}</h3>
                      {proj.link && <span className="text-[10px] font-mono text-cyan-400">{proj.link}</span>}
                    </div>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 my-1.5">
                        {proj.techStack.map((tech, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[10px] font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-300 leading-snug">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {workExperiences.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>//</span> EXPERIENCE
              </h2>
              <div className="space-y-4 font-sans">
                {workExperiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-cyan-500/40 pl-3">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-100">{exp.position}</h3>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {exp.startDate} - {exp.current ? 'PRESENT' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mb-1.5">{exp.company} • {exp.location}</div>
                    <ul className="list-disc ml-4 text-xs text-slate-300 space-y-1">
                      {exp.highlights.map((h, idx) => (
                        <li key={idx} className="leading-normal">{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default Modern & Creative Template Layout
    return (
      <div className="w-full bg-white text-slate-900 p-8 shadow-xl rounded-sm min-h-[1050px] print:shadow-none print:p-0 select-text">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 -mx-8 -mt-8 p-8 text-white rounded-t-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {personalInfo.fullName || 'Your Name'}
              </h1>
              <p className="text-purple-200 font-medium text-base mt-0.5">
                {personalInfo.jobTitle || 'Full Stack Software Engineer'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-purple-100/90">
              {personalInfo.email && (
                <div className="flex items-center gap-1.5">
                  <Mail size={13} className="text-purple-300" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-purple-300" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-purple-300" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-1.5">
                  <Linkedin size={13} className="text-purple-300" />
                  <span>{personalInfo.linkedin}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-purple-900 uppercase tracking-widest border-b-2 border-purple-200 pb-1 mb-2.5">
              About Me / Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">{summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {workExperiences.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-purple-900 uppercase tracking-widest border-b-2 border-purple-200 pb-1 mb-3">
              Work Experience
            </h2>
            <div className="space-y-4">
              {workExperiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 mb-1.5">
                    {exp.company} • {exp.location}
                  </div>
                  {exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-xs text-slate-700 space-y-1">
                      {exp.highlights.map((h, idx) => (
                        <li key={idx} className="leading-snug">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Projects & Portfolio */}
        {projects && projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-purple-900 uppercase tracking-widest border-b-2 border-purple-200 pb-1 mb-3">
              Key Projects & Portfolio
            </h2>
            <div className="space-y-3.5">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{proj.title}</span>
                      {proj.role && <span className="text-[11px] font-normal text-purple-700">({proj.role})</span>}
                    </h3>
                    {proj.link && (
                      <span className="text-[10px] text-purple-700 font-mono flex items-center gap-0.5">
                        <ExternalLink size={10} /> {proj.link}
                      </span>
                    )}
                  </div>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1">
                      {proj.techStack.map((tech, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-medium border border-purple-200/60">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-700 leading-snug">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {educations.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-purple-900 uppercase tracking-widest border-b-2 border-purple-200 pb-1 mb-3">
                Education
              </h2>
              <div className="space-y-2">
                {educations.map((edu) => (
                  <div key={edu.id}>
                    <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                    <div className="text-[11px] text-slate-600">{edu.institution}</div>
                    <div className="text-[10px] text-purple-800 font-medium">
                      {edu.startDate} – {edu.endDate} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-purple-900 uppercase tracking-widest border-b-2 border-purple-200 pb-1 mb-3">
                Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <h4 className="text-xs font-bold text-slate-900">{cert.name}</h4>
                    <div className="text-[11px] text-slate-600">{cert.issuer} ({cert.issueDate})</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-purple-900 uppercase tracking-widest border-b-2 border-purple-200 pb-1 mb-3">
              Core Competencies & Skills
            </h2>
            <div className="space-y-2">
              {skills.map((group, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span className="text-xs font-bold text-slate-800 min-w-[130px]">
                    {group.category}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {group.items.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="resume-preview-document" className="w-full">
      {renderTemplateContent()}
    </div>
  );
};
