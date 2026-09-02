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

    if (templateId === 'corporate') {
      return (
        <div className="w-full bg-white text-slate-900 font-sans p-0 shadow-lg min-h-[1050px] print:shadow-none select-text border border-slate-200">
          {/* Corporate Deep Navy Banner Header */}
          <div className="bg-[#0A192F] text-white p-7 text-center">
            <h1 className="text-3xl font-bold tracking-wide uppercase text-white">
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <p className="text-sm font-semibold text-cyan-300 tracking-widest uppercase mt-1">
              {personalInfo.jobTitle || 'Professional Title'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
              {personalInfo.email && <span className="flex items-center gap-1"><Mail size={12} className="text-cyan-400" /> {personalInfo.email}</span>}
              {personalInfo.phone && <span className="flex items-center gap-1"><Phone size={12} className="text-cyan-400" /> {personalInfo.phone}</span>}
              {personalInfo.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-400" /> {personalInfo.location}</span>}
              {personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin size={12} className="text-cyan-400" /> {personalInfo.linkedin}</span>}
              {personalInfo.portfolio && <span className="flex items-center gap-1"><Globe size={12} className="text-cyan-400" /> {personalInfo.portfolio}</span>}
            </div>
          </div>

          <div className="p-7 space-y-6">
            {/* Summary */}
            {summary && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A192F] border-l-4 border-[#0A192F] pl-3 py-0.5 mb-2 bg-slate-50">
                  Executive Summary
                </h2>
                <p className="text-xs leading-relaxed text-slate-800">{summary}</p>
              </div>
            )}

            {/* Experience */}
            {workExperiences.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A192F] border-l-4 border-[#0A192F] pl-3 py-0.5 mb-3 bg-slate-50">
                  Professional Experience
                </h2>
                <div className="space-y-4">
                  {workExperiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-700 font-medium mb-1">
                        <span>{exp.company}</span>
                        <span>{exp.location}</span>
                      </div>
                      {exp.highlights.length > 0 && (
                        <ul className="list-disc list-outside ml-4 text-xs space-y-1 text-slate-800">
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

            {/* Projects */}
            {projects && projects.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A192F] border-l-4 border-[#0A192F] pl-3 py-0.5 mb-3 bg-slate-50">
                  Key Projects
                </h2>
                <div className="space-y-3 text-xs">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{proj.title} {proj.role ? `• ${proj.role}` : ''}</span>
                        {proj.link && <span className="text-[10px] text-blue-800 font-mono">{proj.link}</span>}
                      </div>
                      {proj.techStack && proj.techStack.length > 0 && (
                        <div className="text-[11px] text-slate-600 mb-0.5">Tech: {proj.techStack.join(', ')}</div>
                      )}
                      <p className="text-slate-800 leading-snug">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {educations.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A192F] border-l-4 border-[#0A192F] pl-3 py-0.5 mb-2 bg-slate-50">
                    Education
                  </h2>
                  <div className="space-y-2 text-xs">
                    {educations.map((edu) => (
                      <div key={edu.id}>
                        <div className="font-bold text-slate-900">{edu.degree}</div>
                        <div className="text-slate-700">{edu.institution}</div>
                        <div className="text-[10px] text-slate-500">{edu.startDate} – {edu.endDate} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {certifications.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A192F] border-l-4 border-[#0A192F] pl-3 py-0.5 mb-2 bg-slate-50">
                    Certifications
                  </h2>
                  <div className="space-y-2 text-xs">
                    {certifications.map((cert) => (
                      <div key={cert.id}>
                        <div className="font-bold text-slate-900">{cert.name}</div>
                        <div className="text-slate-700">{cert.issuer} ({cert.issueDate})</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A192F] border-l-4 border-[#0A192F] pl-3 py-0.5 mb-2 bg-slate-50">
                  Skills & Expertise
                </h2>
                <div className="space-y-1.5 text-xs">
                  {skills.map((group, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-bold text-slate-900 min-w-[120px]">{group.category}:</span>
                      <span className="text-slate-800">{group.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (templateId === 'compact') {
      return (
        <div className="w-full bg-white text-slate-900 font-sans shadow-lg min-h-[1050px] print:shadow-none select-text flex flex-col md:flex-row">
          {/* Left Sidebar */}
          <div className="w-full md:w-1/3 bg-slate-100 p-6 border-r border-slate-200 text-slate-800 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {personalInfo.fullName || 'Your Name'}
              </h1>
              <p className="text-xs font-semibold text-emerald-700 mt-1">
                {personalInfo.jobTitle || 'Job Title'}
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-1.5 text-[11px]">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                Contact
              </h3>
              {personalInfo.email && <div className="break-all flex items-center gap-1.5"><Mail size={12} className="text-emerald-700 shrink-0" /> {personalInfo.email}</div>}
              {personalInfo.phone && <div className="flex items-center gap-1.5"><Phone size={12} className="text-emerald-700 shrink-0" /> {personalInfo.phone}</div>}
              {personalInfo.location && <div className="flex items-center gap-1.5"><MapPin size={12} className="text-emerald-700 shrink-0" /> {personalInfo.location}</div>}
              {personalInfo.linkedin && <div className="break-all flex items-center gap-1.5"><Linkedin size={12} className="text-emerald-700 shrink-0" /> {personalInfo.linkedin}</div>}
              {personalInfo.github && <div className="break-all flex items-center gap-1.5"><Github size={12} className="text-emerald-700 shrink-0" /> {personalInfo.github}</div>}
              {personalInfo.portfolio && <div className="break-all flex items-center gap-1.5"><Globe size={12} className="text-emerald-700 shrink-0" /> {personalInfo.portfolio}</div>}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                  Skills
                </h3>
                <div className="space-y-3 text-[11px]">
                  {skills.map((group, idx) => (
                    <div key={idx}>
                      <div className="font-bold text-slate-900 text-[10px] uppercase mb-1">{group.category}</div>
                      <div className="flex flex-wrap gap-1">
                        {group.items.map((item, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-900 text-[10px] font-medium border border-emerald-200">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                  Education
                </h3>
                <div className="space-y-2 text-[11px]">
                  {educations.map((edu) => (
                    <div key={edu.id}>
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-600">{edu.institution}</div>
                      <div className="text-[10px] text-emerald-800">{edu.startDate} – {edu.endDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                  Certifications
                </h3>
                <div className="space-y-2 text-[11px]">
                  {certifications.map((cert) => (
                    <div key={cert.id}>
                      <div className="font-bold text-slate-900">{cert.name}</div>
                      <div className="text-slate-600">{cert.issuer} ({cert.issueDate})</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="w-full md:w-2/3 p-6 space-y-5">
            {summary && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-emerald-600 pb-1 mb-2">
                  Profile Summary
                </h2>
                <p className="text-xs text-slate-800 leading-snug">{summary}</p>
              </div>
            )}

            {workExperiences.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-emerald-600 pb-1 mb-3">
                  Experience
                </h2>
                <div className="space-y-3.5">
                  {workExperiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-600 mb-1">{exp.company} • {exp.location}</div>
                      {exp.highlights.length > 0 && (
                        <ul className="list-disc list-outside ml-4 text-xs space-y-0.5 text-slate-800">
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

            {projects && projects.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-emerald-600 pb-1 mb-3">
                  Projects
                </h2>
                <div className="space-y-3 text-xs">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{proj.title} {proj.role ? `(${proj.role})` : ''}</span>
                        {proj.link && <span className="text-[10px] text-emerald-700 font-mono">{proj.link}</span>}
                      </div>
                      {proj.techStack && proj.techStack.length > 0 && (
                        <div className="text-[10px] text-slate-500 mb-0.5">Tech: {proj.techStack.join(', ')}</div>
                      )}
                      <p className="text-slate-800 leading-tight">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (templateId === 'minimal') {
      return (
        <div className="w-full bg-white text-zinc-900 font-sans p-8 shadow-lg min-h-[1050px] print:shadow-none select-text border border-zinc-200 space-y-6">
          {/* Swiss Minimalist Header */}
          <div>
            <h1 className="text-3xl font-light text-zinc-900 tracking-tight">
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">
              {personalInfo.jobTitle || 'Professional Title'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600 mt-3 pt-3 border-t border-zinc-200">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>| {personalInfo.phone}</span>}
              {personalInfo.location && <span>| {personalInfo.location}</span>}
              {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
              {personalInfo.portfolio && <span>| {personalInfo.portfolio}</span>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="pt-2 border-t border-zinc-200">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Summary
              </h2>
              <p className="text-xs text-zinc-800 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {workExperiences.length > 0 && (
            <div className="pt-2 border-t border-zinc-200">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
                Experience
              </h2>
              <div className="space-y-4">
                {workExperiences.map((exp) => (
                  <div key={exp.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="text-[11px] font-mono text-zinc-500 md:col-span-1">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xs font-bold text-zinc-900">{exp.position}</h3>
                        <span className="text-[11px] text-zinc-500">{exp.location}</span>
                      </div>
                      <div className="text-[11px] text-zinc-700 font-medium">{exp.company}</div>
                      {exp.highlights.length > 0 && (
                        <ul className="list-disc list-outside ml-4 text-xs space-y-1 text-zinc-800 pt-1">
                          {exp.highlights.map((h, idx) => (
                            <li key={idx} className="leading-snug">{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="pt-2 border-t border-zinc-200">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                Projects
              </h2>
              <div className="space-y-3 text-xs">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline font-bold text-zinc-900">
                      <span>{proj.title} {proj.role ? `(${proj.role})` : ''}</span>
                      {proj.link && <span className="text-[10px] font-mono text-zinc-500">{proj.link}</span>}
                    </div>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="text-[10px] text-zinc-500 mb-0.5">Stack: {proj.techStack.join(', ')}</div>
                    )}
                    <p className="text-zinc-700 leading-snug">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-zinc-200">
            {skills.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Skills
                </h2>
                <div className="space-y-1 text-xs">
                  {skills.map((group, idx) => (
                    <div key={idx}>
                      <span className="font-bold text-zinc-800">{group.category}: </span>
                      <span className="text-zinc-700">{group.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {educations.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Education & Certifications
                </h2>
                <div className="space-y-2 text-xs">
                  {educations.map((edu) => (
                    <div key={edu.id}>
                      <div className="font-bold text-zinc-900">{edu.degree}</div>
                      <div className="text-zinc-600">{edu.institution} ({edu.startDate} – {edu.endDate})</div>
                    </div>
                  ))}
                  {certifications.map((cert) => (
                    <div key={cert.id}>
                      <div className="font-bold text-zinc-900">{cert.name}</div>
                      <div className="text-zinc-600">{cert.issuer} ({cert.issueDate})</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (templateId === 'startup') {
      return (
        <div className="w-full bg-white text-slate-900 font-sans p-7 shadow-lg min-h-[1050px] print:shadow-none select-text space-y-6">
          {/* Startup Gradient Banner Header */}
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white p-6 rounded-2xl shadow-md">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <div className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full mt-2">
              {personalInfo.jobTitle || 'Growth & Tech Professional'}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-teal-50 mt-4 pt-3 border-t border-white/20">
              {personalInfo.email && <span className="flex items-center gap-1"><Mail size={12} /> {personalInfo.email}</span>}
              {personalInfo.phone && <span className="flex items-center gap-1"><Phone size={12} /> {personalInfo.phone}</span>}
              {personalInfo.location && <span className="flex items-center gap-1"><MapPin size={12} /> {personalInfo.location}</span>}
              {personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin size={12} /> {personalInfo.linkedin}</span>}
              {personalInfo.github && <span className="flex items-center gap-1"><Github size={12} /> {personalInfo.github}</span>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div>
              <span className="bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-teal-200 inline-block mb-2">
                About & Summary
              </span>
              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-200">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {workExperiences.length > 0 && (
            <div>
              <span className="bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-teal-200 inline-block mb-3">
                Experience & Impact
              </span>
              <div className="space-y-3">
                {workExperiences.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-teal-700 mb-2">{exp.company} • {exp.location}</div>
                    {exp.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 text-xs space-y-1 text-slate-800">
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

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div>
              <span className="bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-teal-200 inline-block mb-3">
                Featured Projects
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between items-baseline font-bold text-slate-900 mb-1">
                      <span>{proj.title}</span>
                      {proj.link && <span className="text-[10px] text-teal-700 font-mono">{proj.link}</span>}
                    </div>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {proj.techStack.map((tech, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-900 text-[10px] font-semibold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-slate-700 leading-snug">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.length > 0 && (
              <div>
                <span className="bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-teal-200 inline-block mb-3">
                  Skills & Tools
                </span>
                <div className="space-y-2 text-xs">
                  {skills.map((group, idx) => (
                    <div key={idx}>
                      <div className="font-bold text-slate-800 text-[11px] mb-1">{group.category}</div>
                      <div className="flex flex-wrap gap-1">
                        {group.items.map((item, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {educations.length > 0 && (
              <div>
                <span className="bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-teal-200 inline-block mb-3">
                  Education & Certs
                </span>
                <div className="space-y-2 text-xs">
                  {educations.map((edu) => (
                    <div key={edu.id} className="p-2.5 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-600">{edu.institution}</div>
                      <div className="text-[10px] text-teal-700 font-semibold">{edu.startDate} – {edu.endDate}</div>
                    </div>
                  ))}
                  {certifications.map((cert) => (
                    <div key={cert.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-900">{cert.name}</div>
                      <div className="text-slate-600">{cert.issuer} ({cert.issueDate})</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
