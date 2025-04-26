
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const ImportCard = ({ title, description, icon, onClick, className }: ImportCardProps) => {
  return (
    <Card 
      className={cn("cursor-pointer transition-all hover:border-brand-purple hover:shadow-md", className)}
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center gap-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-medium">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportCard;
