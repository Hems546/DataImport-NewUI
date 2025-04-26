
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValidationCategory } from "@/constants/validations";
import { Edit } from "lucide-react";

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
  const handleSaveChanges = (category: ValidationCategory) => {
    onSave({
      ...validation,
      category,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Validation: {validation.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Validation Stage</label>
            <Select
              defaultValue={validation.category}
              onValueChange={(value) => handleSaveChanges(value as ValidationCategory)}
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
            <h3 className="text-sm font-medium">Current Settings</h3>
            <div className="rounded-md bg-muted p-3 text-sm">
              <p><strong>Type:</strong> {validation.type || 'Not specified'}</p>
              <p><strong>Severity:</strong> {validation.severity || 'Not specified'}</p>
              {validation.failAction && (
                <p><strong>Fail Action:</strong> {validation.failAction}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
