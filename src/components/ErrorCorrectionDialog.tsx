
import React, { useState } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export interface ErrorRow {
  rowIndex: number;
  rowData: Record<string, any>;
  errorColumns: string[];
}

interface ErrorCorrectionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  errorRows: ErrorRow[];
  onSaveCorrections: (correctedRows: ErrorRow[]) => void;
}

const ErrorCorrectionDialog = ({
  open,
  onClose,
  title,
  description,
  errorRows,
  onSaveCorrections,
}: ErrorCorrectionDialogProps) => {
  const { toast } = useToast();
  const [editedRows, setEditedRows] = useState<ErrorRow[]>(
    JSON.parse(JSON.stringify(errorRows))
  );

  const handleValueChange = (rowIndex: number, column: string, value: string) => {
    const newRows = [...editedRows];
    const rowToEditIndex = newRows.findIndex(
      (row) => row.rowIndex === rowIndex
    );
    
    if (rowToEditIndex !== -1) {
      newRows[rowToEditIndex].rowData[column] = value;
    }
    
    setEditedRows(newRows);
  };

  const handleSaveCorrections = () => {
    onSaveCorrections(editedRows);
    toast({
      title: "Changes saved",
      description: "Your corrections have been applied.",
    });
    onClose();
  };

  // Get all column names from the data
  const allColumns = errorRows.length > 0 
    ? Object.keys(errorRows[0].rowData)
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {title}
          </DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>

        <div className="my-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Row</TableHead>
                {allColumns.map((column) => (
                  <TableHead 
                    key={column}
                    className={errorRows.some(row => 
                      row.errorColumns.includes(column)
                    ) ? "bg-yellow-50" : ""}
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {editedRows.map((row) => (
                <TableRow key={`row-${row.rowIndex}`}>
                  <TableCell className="font-medium">{row.rowIndex + 1}</TableCell>
                  {allColumns.map((column) => (
                    <TableCell 
                      key={`${row.rowIndex}-${column}`}
                      className={row.errorColumns.includes(column) ? "bg-yellow-50" : ""}
                    >
                      {row.errorColumns.includes(column) ? (
                        <Input
                          value={row.rowData[column] || ""}
                          onChange={(e) => 
                            handleValueChange(row.rowIndex, column, e.target.value)
                          }
                          className="border-yellow-300 focus:border-yellow-500"
                        />
                      ) : (
                        row.rowData[column]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSaveCorrections} className="bg-brand-purple hover:bg-brand-purple/90">
            <Save className="mr-2 h-4 w-4" />
            Save Corrections
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorCorrectionDialog;
