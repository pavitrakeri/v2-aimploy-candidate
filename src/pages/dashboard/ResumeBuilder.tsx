import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResumeData, ResumeTemplateId } from '@/types/resume';
import { getInitialResumeForUser, AIResumeService } from '@/services/aiResumeService';
import { TemplateSelector } from '@/components/resume/TemplateSelector';
import { ResumeForm } from '@/components/resume/ResumeForm';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Download, Printer, Layout, RefreshCw, CheckCircle2, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

export const ResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const { collapsed, setCollapsed, toggleCollapsed } = useSidebar();
  const userId = user?.id ? String(user.id) : (user?.email ? user.email.toLowerCase() : 'guest');
  const userStorageKey = `aimploy_resume_data_${userId}`;

  const [resumeData, setResumeDataState] = useState<ResumeData>(() => getInitialResumeForUser(user));
  const [scale, setScale] = useState<number>(1);
  const [magicPrompt, setMagicPrompt] = useState<string>('');

  // Auto collapse sidebar for maximum canvas space in Resume Builder
  useEffect(() => {
    setCollapsed(true);
  }, []);

  // Sync state when user context finishes loading or changes
  useEffect(() => {
    const userResume = getInitialResumeForUser(user);
    setResumeDataState(userResume);
  }, [user?.id, user?.email]);

  const setResumeData = (updater: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    setResumeDataState((prev) => {
      const nextData = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined' && userStorageKey) {
        localStorage.setItem(userStorageKey, JSON.stringify(nextData));
      }
      return nextData;
    });
  };

  const handleTemplateChange = (templateId: ResumeTemplateId) => {
    setResumeData((prev) => ({ ...prev, templateId }));
    toast.success(`Applied ${templateId.toUpperCase()} template style!`);
  };

  const handleMagicPromptChange = (val: string) => {
    setMagicPrompt(val);
    if (val.trim().length > 5) {
      const updated = AIResumeService.parseNaturalLanguageResumePrompt(val, resumeData);
      setResumeData(updated);
    }
  };

  const handleMagicFillClick = () => {
    if (!magicPrompt.trim()) {
      toast.error('Please enter a description or prompt to AI auto-fill!');
      return;
    }
    const updated = AIResumeService.parseNaturalLanguageResumePrompt(magicPrompt, resumeData);
    setResumeData(updated);
    toast.success('AI successfully extracted & auto-filled your resume sections!');
  };

  const handlePrint = () => {
    const resumeEl = document.getElementById('resume-preview-document');
    if (!resumeEl) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=850,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((s) => s.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume - ${resumeData.personalInfo.fullName}</title>
          ${styles}
          <style>
            @page { margin: 0; size: A4 portrait; }
            body { 
              margin: 0; 
              padding: 0; 
              background: #ffffff !important; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
              display: flex;
              justify-content: center;
            }
            .no-print, header, sidebar, footer, nav { display: none !important; }
            #resume-preview-document {
              width: 210mm !important;
              min-height: 297mm !important;
              box-shadow: none !important;
              margin: 0 !important;
              border: none !important;
            }
          </style>
        </head>
        <body>
          ${resumeEl.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const handleDownloadPDF = () => {
    toast.success('Generating and downloading your resume PDF...');
    handlePrint();
  };

  const handleReset = () => {
    if (typeof window !== 'undefined' && userStorageKey) {
      localStorage.removeItem(userStorageKey);
    }
    const freshData = getInitialResumeForUser(user);
    setResumeDataState(freshData);
    toast.success('Reset resume to your profile default!');
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1440px] mx-auto px-2 sm:px-4">
      {/* Header Banner */}
      <div className="no-print bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={20} className="text-yellow-300 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/10 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
              AI Resume Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create & Customize Your Resume</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Auto-generate, edit, and fine-tune your resume with AI assistance. Select from 10 ATS-optimized templates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={toggleCollapsed}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5 h-9 px-3"
            title={collapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            {collapsed ? "Expand Nav" : "Collapse Nav"}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5 h-9 px-3"
          >
            <RefreshCw size={14} /> Reset Defaults
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5 h-9 px-3"
          >
            <Printer size={14} /> Print
          </Button>
          <Button
            onClick={handleDownloadPDF}
            size="sm"
            className="bg-[#9000FF] hover:bg-[#7b00da] text-white text-xs gap-1.5 font-bold h-9 px-4 shadow-lg cursor-pointer transition-all"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Template Selector Section */}
      <Card className="no-print border-border/60 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layout size={16} className="text-primary" /> Choose Resume Template Format (10 Options)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <TemplateSelector
            selectedTemplateId={resumeData.templateId}
            onSelectTemplate={handleTemplateChange}
          />
        </CardContent>
      </Card>

      {/* Main Split Screen Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="no-print lg:col-span-6 space-y-4">
          <Card className="border-2 border-purple-500/30 dark:border-purple-500/20 shadow-xl bg-card rounded-2xl overflow-hidden">
            <CardHeader className="pb-3.5 pt-4 bg-gradient-to-r from-purple-950/20 via-indigo-950/20 to-slate-900/20 border-b border-purple-500/20 flex flex-row items-center justify-between px-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#9000FF] text-white flex items-center justify-center shadow-md shrink-0">
                  <Wand2 size={16} />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Resume Data & AI Editor</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                      AI Powered 2.0
                    </span>
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Real-time auto-saving resume section editor</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 shrink-0">
                <CheckCircle2 size={13} className="text-green-500" /> Auto-Saved
              </span>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <ResumeForm data={resumeData} onChange={setResumeData} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Document Preview */}
        <div className="lg:col-span-6 sticky top-20">
          <Card className="overflow-hidden border-2 border-primary/20 shadow-xl bg-card">
            <CardHeader className="pb-2.5 pt-3 bg-muted/40 border-b flex flex-row items-center justify-between no-print px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span>Live Preview</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-mono border border-primary/20">
                  {resumeData.templateId.toUpperCase()}
                </span>
              </CardTitle>
              <div className="flex items-center gap-1.5 bg-background border rounded-lg p-0.5 shadow-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
                  className="h-7 w-7 p-0 text-xs font-mono"
                  title="Zoom Out"
                >
                  -
                </Button>
                <span className="text-[11px] font-mono font-bold w-12 text-center text-muted-foreground">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setScale((s) => Math.min(1.3, s + 0.1))}
                  className="h-7 w-7 p-0 text-xs font-mono"
                  title="Zoom In"
                >
                  +
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setScale(1)}
                  className="h-7 px-2 text-[10px] font-mono border-l rounded-none text-muted-foreground hover:text-foreground"
                  title="Reset Zoom"
                >
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex justify-center bg-slate-900/5 dark:bg-slate-950/40 overflow-auto max-h-[calc(100vh-200px)] min-h-[600px]">
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full flex justify-center"
              >
                <ResumePreview data={resumeData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
