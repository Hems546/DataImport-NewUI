import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface StatusDropdownProps {
  options: StatusOption[];
  defaultText: string;
  onSelect: (value: string) => void;
  value: string;
  outerStyles?: React.CSSProperties;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  options,
  defaultText,
  onSelect,
  value,
  outerStyles
}) => {
  return (
    <div style={outerStyles}>
      <Select value={value} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder={defaultText} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusDropdown; 