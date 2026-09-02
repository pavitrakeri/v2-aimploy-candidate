import React from 'react';
import { ResumeTemplateId } from '@/types/resume';
import { cn } from '@/lib/utils';
import { Sparkles, Check, Layout, Shield, Code, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplateOption {
  id: ResumeTemplateId;
  name: string;
  tagline: string;
  icon: React.ElementType;
  accentColor: string;
  badge?: string;
}

const templates: TemplateOption[] = [
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
];

interface TemplateSelectorProps {
  selectedTemplateId: ResumeTemplateId;
  onSelectTemplate: (id: ResumeTemplateId) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {templates.map((tpl) => {
        const isSelected = selectedTemplateId === tpl.id;
        const Icon = tpl.icon;

        return (
          <div
            key={tpl.id}
            onClick={() => onSelectTemplate(tpl.id)}
            className={cn(
              'relative group cursor-pointer p-4 rounded-xl border transition-all duration-200 bg-card hover:shadow-md',
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            {tpl.badge && (
              <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {tpl.badge}
              </span>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-sm',
                  tpl.accentColor
                )}
              >
                <Icon size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  {tpl.name}
                  {isSelected && <Check size={14} className="text-primary" />}
                </h4>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {tpl.tagline}
            </p>
          </div>
        );
      })}
    </div>
  );
};
