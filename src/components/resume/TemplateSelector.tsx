import React from 'react';
import { ResumeTemplateId } from '@/types/resume';
import { cn } from '@/lib/utils';
import { Check, Layout, Shield, Code, Palette, Briefcase, Columns, Feather, Rocket } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TemplateOption {
  id: ResumeTemplateId;
  name: string;
  tagline: string;
  icon: React.ElementType;
  accentColor: string;
  badge?: string;
}

export const templates: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern Clean',
    tagline: 'Sleek two-column header with purple accent & high readability',
    icon: Layout,
    accentColor: 'from-purple-600 to-indigo-600',
    badge: 'Popular',
  },
  {
    id: 'executive',
    name: 'Executive Elegant',
    tagline: 'Classic, ATS-optimized single column layout with refined typography',
    icon: Shield,
    accentColor: 'from-slate-700 to-slate-900',
  },
  {
    id: 'tech',
    name: 'Tech & Minimalist',
    tagline: 'Developer-focused structure highlighting tech stack & projects',
    icon: Code,
    accentColor: 'from-blue-600 to-cyan-600',
    badge: 'Best for Tech',
  },
  {
    id: 'creative',
    name: 'Creative Accent',
    tagline: 'Vibrant side panel accent, tag badges, and visual section dividers',
    icon: Palette,
    accentColor: 'from-violet-600 to-pink-600',
  },
  {
    id: 'corporate',
    name: 'Corporate Classic',
    tagline: 'Deep navy header banner, structured borders, and formal ATS typography',
    icon: Briefcase,
    accentColor: 'from-blue-900 to-slate-800',
    badge: 'Corporate',
  },
  {
    id: 'compact',
    name: 'Compact 1-Page',
    tagline: 'Dense 2-column sidebar layout fitting maximum experience in 1 page',
    icon: Columns,
    accentColor: 'from-emerald-700 to-teal-800',
    badge: '1-Page Fit',
  },
  {
    id: 'minimal',
    name: 'Swiss Minimalist',
    tagline: 'Monochromatic ultra-clean grid layout with refined spacing & borders',
    icon: Feather,
    accentColor: 'from-zinc-700 to-zinc-900',
  },
  {
    id: 'startup',
    name: 'Startup & Growth',
    tagline: 'Teal gradient header with card highlights, badge tags & modern flair',
    icon: Rocket,
    accentColor: 'from-teal-500 to-emerald-600',
    badge: 'Trending',
  },
];

interface TemplateSelectorProps {
  selectedTemplateId: ResumeTemplateId;
  onSelectTemplate: (id: ResumeTemplateId) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const CurrentIcon = currentTemplate.icon;

  return (
    <div>
      {/* Dropdown Selector Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-muted/40 rounded-xl border border-border/60">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-sm shrink-0", currentTemplate.accentColor)}>
            <CurrentIcon size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              <span>Active Format: <strong className="text-primary font-bold">{currentTemplate.name}</strong></span>
              {currentTemplate.badge && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase border border-primary/20">
                  {currentTemplate.badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{currentTemplate.tagline}</p>
          </div>
        </div>

        <div className="w-full sm:w-80 shrink-0">
          <Select
            value={selectedTemplateId}
            onValueChange={(val) => onSelectTemplate(val as ResumeTemplateId)}
          >
            <SelectTrigger className="h-10 text-xs font-semibold bg-background border-border/80 shadow-sm hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Choose Template Format..." />
            </SelectTrigger>
            <SelectContent className="max-h-[320px] z-[100]">
              {templates.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <SelectItem key={tpl.id} value={tpl.id} className="text-xs py-2.5 cursor-pointer">
                    <div className="flex items-center justify-between w-full gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white bg-gradient-to-br shrink-0 text-xs", tpl.accentColor)}>
                          <Icon size={13} />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground block">{tpl.name}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 font-normal">{tpl.tagline}</span>
                        </div>
                      </div>
                      {tpl.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 ml-2 shrink-0">
                          {tpl.badge}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
