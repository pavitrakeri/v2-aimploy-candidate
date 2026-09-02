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
    <div className="space-y-3">
      {/* 8 Compact Pill Badges Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {templates.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          const Icon = tpl.icon;

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelectTemplate(tpl.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/40'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-md flex items-center justify-center text-white bg-gradient-to-br shrink-0 text-[10px]',
                  tpl.accentColor
                )}
              >
                <Icon size={12} />
              </div>
              <span>{tpl.name}</span>
              {tpl.badge && (
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border',
                    isSelected
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-primary/10 text-primary border-primary/20'
                  )}
                >
                  {tpl.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Template Info Strip */}
      <div className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 text-xs">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-sm shrink-0", currentTemplate.accentColor)}>
            <CurrentIcon size={15} />
          </div>
          <div>
            <span className="font-bold text-foreground">{currentTemplate.name}</span>
            <span className="text-muted-foreground ml-2 text-[11px]">— {currentTemplate.tagline}</span>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono bg-background px-2.5 py-1 rounded-md border border-border shrink-0">
          Format #{templates.findIndex((t) => t.id === selectedTemplateId) + 1} of 8
        </span>
      </div>
    </div>
  );
};
