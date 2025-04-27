
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValidationCategory, getTechnicalDescription } from "@/constants/validations";
import { Edit } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EditValidationDialogProps {
  validation: {
    id: string;
    name: string;
    description: string;
    category: ValidationCategory;
    severity?: string;
    type?: string;
    failAction?: string;
  };
  onSave: (updatedValidation: any) => void;
}

export function EditValidationDialog({ validation, onSave }: EditValidationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ValidationCategory>(validation.category);

  const handleSaveChanges = () => {
    onSave({
      ...validation,
      category: selectedCategory,
    });
    setOpen(false);
  };

  const renderTechnicalDetails = (details: string | string[] | undefined) => {
    if (!details) return null;
    
    if (typeof details === 'string') {
      return <p className="text-slate-700">{details}</p>;
    }
    
    return details.map((detail, index) => (
      <p key={index} className={cn(
        "text-slate-700",
        detail.startsWith('-') ? 'ml-4' : '',
        detail.match(/^\d+\./) ? 'ml-4' : ''
      )}>
        {detail.startsWith('-') || detail.match(/^\d+\./) ? detail : `• ${detail}`}
      </p>
    ));
  };

  const isCriticalSeverity = validation.severity === 'critical';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Validation: {validation.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Validation Stage</label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as ValidationCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ValidationCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Validation Configuration</h3>
            <div className="rounded-md bg-muted p-3 text-sm space-y-2">
              <p><strong>Type:</strong> {validation.type || 'Not specified'}</p>
              <p>
                <strong>Severity:</strong> 
                <span className={validation.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}>
                  {' '}{validation.severity || 'Not specified'}
                </span>
                {!isCriticalSeverity && (
                  <span className="ml-2 text-xs text-gray-500">(Can be overridden)</span>
                )}
              </p>
              {validation.failAction && (
                <p><strong>Fail Action:</strong> {validation.failAction}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Technical Implementation</h3>
            <div className="rounded-md bg-slate-100 p-3 text-sm space-y-1">
              {renderTechnicalDetails(getTechnicalDescription(validation.id))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">{validation.description}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
