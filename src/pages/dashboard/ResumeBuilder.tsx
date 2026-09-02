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
import { Sparkles, Download, Printer, Layout, RefreshCw, CheckCircle2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const ResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : (user?.email ? user.email.toLowerCase() : 'guest');
  const userStorageKey = `aimploy_resume_data_${userId}`;

  const [resumeData, setResumeDataState] = useState<ResumeData>(() => getInitialResumeForUser(user));
  const [scale, setScale] = useState<number>(1);
  const [magicPrompt, setMagicPrompt] = useState<string>('');

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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="no-print bg-gradient-to-r from-[#9000FF] via-[#7000CC] to-[#500099] p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={22} className="text-yellow-300 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full">
              AI Resume Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create & Customize Your Resume</h1>
          <p className="text-sm text-purple-200/90 mt-1 max-w-xl">
            Type your info in natural language or use section prompts to auto-generate a professional resume.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5"
          >
            <RefreshCw size={14} /> Reset
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5"
          >
            <Printer size={14} /> Print
          </Button>
          <Button
            onClick={handleDownloadPDF}
            size="sm"
            className="bg-[#9000FF] hover:bg-[#7b00da] text-white text-xs gap-1.5 font-semibold shadow-md"
          >
            <Download size={14} /> Download PDF
          </Button>
        </div>
      </div>

      {/* Template Selector Section */}
      <Card className="no-print">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layout size={16} className="text-primary" /> Choose Resume Template Format
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Resume Data & AI Editor</span>
                <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-green-500" /> Auto-Saving
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResumeForm data={resumeData} onChange={setResumeData} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Document Preview */}
        <div className="lg:col-span-6 sticky top-20">
          <Card className="overflow-hidden border-2 border-primary/20 shadow-xl bg-muted/30">
            <CardHeader className="pb-2 bg-card border-b flex flex-row items-center justify-between no-print">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span>Live Preview</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
                  {resumeData.templateId.toUpperCase()}
                </span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setScale((s) => Math.max(0.8, s - 0.1))}
                  className="h-7 w-7 p-0 text-xs font-mono"
                >
                  -
                </Button>
                <span className="text-xs font-mono text-muted-foreground">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
                  className="h-7 w-7 p-0 text-xs font-mono"
                >
                  +
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex justify-center bg-[#525659]/10 overflow-auto max-h-[82vh]">
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
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

