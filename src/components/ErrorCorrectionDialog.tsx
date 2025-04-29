
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pen, Save, X } from "lucide-react";
import { ValidationResult } from './ValidationStatus';

interface ErrorCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validation: ValidationResult;
  onSave: (correctedRows: any[]) => void;
}

const ErrorCorrectionDialog = ({
  open,
  onOpenChange,
  validation,
  onSave
}: ErrorCorrectionDialogProps) => {
  const [editableRows, setEditableRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    if (validation.affectedRows && validation.affectedRows.length > 0) {
      // Extract headers from the first row's data
      const firstRow = validation.affectedRows[0].rowData;
      if (firstRow) {
        setHeaders(Object.keys(firstRow));
      }

      // Create editable rows data
      setEditableRows(
        validation.affectedRows.map(row => ({
          ...row,
          isEditing: false,
          correctedValue: row.value || ''
        }))
      );
    }
  }, [validation]);

  const handleEdit = (rowIndex: number) => {
    setEditableRows(
      editableRows.map((row, idx) => 
        idx === rowIndex ? { ...row, isEditing: true } : row
      )
    );
  };

  const handleSave = (rowIndex: number) => {
    setEditableRows(
      editableRows.map((row, idx) => 
        idx === rowIndex ? { ...row, isEditing: false, value: row.correctedValue } : row
      )
    );
  };

  const handleInputChange = (rowIndex: number, value: string) => {
    setEditableRows(
      editableRows.map((row, idx) => 
        idx === rowIndex ? { ...row, correctedValue: value } : row
      )
    );
  };

  const handleSaveAll = () => {
    // Prepare corrected data for parent component
    const correctedData = editableRows.map(row => ({
      rowIndex: row.rowIndex,
      originalValue: validation.affectedRows?.find(r => r.rowIndex === row.rowIndex)?.value || '',
      correctedValue: row.correctedValue || row.value,
      rowData: row.rowData
    }));
    
    onSave(correctedData);
  };

  // Find column index for the email field
  const getEmailColumnIndex = () => {
    if (headers.length === 0) return -1;
    
    const emailFieldNames = ['email', 'e-mail', 'email_address', 'emailaddress'];
    return headers.findIndex(header => 
      emailFieldNames.includes(header.toLowerCase())
    );
  };

  const emailColumnIndex = getEmailColumnIndex();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Fix Email Format Issues</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Row</TableHead>
                {headers.map((header, index) => (
                  <TableHead 
                    key={index}
                    className={cn(
                      index === emailColumnIndex ? 'bg-yellow-50' : ''
                    )}
                  >
                    {header}
                    {index === emailColumnIndex && (
                      <div className="text-xs text-yellow-600">Contains format issues</div>
                    )}
                  </TableHead>
                ))}
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableRows.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  <TableCell className="font-medium">{row.rowIndex + 1}</TableCell>
                  
                  {headers.map((header, colIdx) => (
                    <TableCell 
                      key={colIdx} 
                      className={cn(
                        colIdx === emailColumnIndex ? 'bg-yellow-50' : ''
                      )}
                    >
                      {colIdx === emailColumnIndex ? (
                        row.isEditing ? (
                          <Input 
                            value={row.correctedValue} 
                            onChange={(e) => handleInputChange(rowIdx, e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-red-600">{row.value || row.rowData?.[header]}</span>
                        )
                      ) : (
                        row.rowData?.[header]
                      )}
                    </TableCell>
                  ))}
                  
                  <TableCell className="text-right">
                    {row.isEditing ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSave(rowIdx)}
                      >
                        <Save className="h-4 w-4 text-green-600" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(rowIdx)}
                      >
                        <Pen className="h-4 w-4 text-blue-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSaveAll}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper function from utils
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ');
};

export default ErrorCorrectionDialog;
