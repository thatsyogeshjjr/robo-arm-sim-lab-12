import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface MechanicalTooltipProps {
  title: string;
  definition: string;
  impact: string;
  children?: React.ReactNode;
}

export function MechanicalTooltip({ title, definition, impact, children }: MechanicalTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3" side="left">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">{definition}</p>
            <div className="border-t pt-2">
              <p className="text-xs font-medium text-primary">Impact on Robot:</p>
              <p className="text-xs text-muted-foreground">{impact}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}