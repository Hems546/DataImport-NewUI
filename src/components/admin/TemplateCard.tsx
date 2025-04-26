
import { FileEdit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TemplateCardProps {
  title: string;
  fields: number;
  required: number;
}

export default function TemplateCard({ title, fields, required }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <h4 className="text-lg font-semibold mb-2">{title}</h4>
          <p className="text-sm text-gray-600">
            {fields} fields ({required} required)
          </p>
        </div>
        <button className="text-primary hover:text-primary/80">
          <FileEdit className="w-5 h-5" />
        </button>
      </CardContent>
    </Card>
  );
}
