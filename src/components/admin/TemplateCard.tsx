
import { FileEdit, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditTemplateDialog } from "./EditTemplateDialog";

interface TemplateField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface TemplateCardProps {
  title: string;
  description: string;
  fields: TemplateField[];
  maxRowCount?: number;
  onUpdate?: (template: { title: string; description: string; fields: TemplateField[]; maxRowCount?: number }) => void;
}

export default function TemplateCard({ title, description, fields, maxRowCount, onUpdate }: TemplateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const requiredFields = fields.filter(field => field.required);

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleSave = (updatedTemplate: { title: string; description: string; fields: TemplateField[]; maxRowCount?: number }) => {
    onUpdate?.(updatedTemplate);
    setIsEditDialogOpen(false); // Close the dialog when saved
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-semibold">{title}</h4>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <button 
              onClick={handleEditClick}
              className="text-primary hover:text-primary/80"
            >
              <FileEdit className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{fields.length} fields</Badge>
            <Badge variant="secondary">{requiredFields.length} required</Badge>
            {maxRowCount && <Badge variant="outline">Max {maxRowCount.toLocaleString()} rows</Badge>}
          </div>

          {fields.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide fields
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show fields
                </>
              )}
            </button>
          )}

          {isExpanded && (
            <div className="mt-4 space-y-2">
              {fields.map((field) => (
                <div key={field.name} className="p-2 bg-gray-50 rounded-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium">{field.name}</span>
                      <p className="text-sm text-gray-600">{field.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{field.type}</Badge>
                      {field.required && (
                        <Badge variant="destructive">Required</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditTemplateDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        template={{ title, description, fields, maxRowCount }}
        onSave={handleSave}
      />
    </>
  );
}
