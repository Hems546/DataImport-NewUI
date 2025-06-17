import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidePanelProps {
  title: string | React.ReactNode;
  isMouseOutClose?: boolean;
  isBackgroundDisable?: boolean;
  style?: React.CSSProperties;
  containerCSS?: React.CSSProperties;
  onClose: () => void;
  children: React.ReactNode;
  customButton?: {
    label: string;
    type: 'primary' | 'secondary' | 'light';
    buttonFunction: () => void;
  }[];
  loader?: boolean;
}

const SidePanel: React.FC<SidePanelProps> = ({
  title,
  isMouseOutClose = true,
  isBackgroundDisable = false,
  style,
  containerCSS,
  onClose,
  children,
  customButton,
  loader = false
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={isMouseOutClose ? onClose : undefined}
      />
      <div 
        className="relative bg-white rounded-lg shadow-lg"
        style={style}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div 
          className="p-4"
          style={containerCSS}
        >
          {loader ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            children
          )}
        </div>
        {customButton && (
          <div className="flex justify-end gap-2 p-4 border-t">
            {customButton.map((button, index) => (
              <Button
                key={index}
                variant={button.type === 'primary' ? 'default' : 'outline'}
                onClick={button.buttonFunction}
              >
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel; 