import React, { useEffect, useState, useCallback } from "react";
import { preflightService } from "@/services/preflightService";
import Header from "@/components/Header";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/SortableHeader";
import ResizableTableHeader from "@/components/ResizableTableHeader";
import TableFilters from "@/components/TableFilters";
import NameBubble from "../components/NameBubble";
import { BiDownload } from "react-icons/bi";
import deleteIcon from "@/assets/deleteIcon.svg";
import csvIcon from "@/assets/csvIcon.svg";
import xlsIcon from "@/assets/xlsIcon.svg";
import xlsxIcon from "@/assets/xlsxIcon.svg";
import pdfIcon from "@/assets/pdfIcon.svg";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "@/styles/table.css";
import PagerTop from "../components/Pager";

const STATUS_OPTIONS = [
  { value: "All", label: "Show All Imports", color: "black" },
  { value: "Not Started", label: "Not Started", color: "#A3A3A3" },
  { value: "In Progress", label: "In Progress", color: "#F59E42" },
  { value: "Warning", label: "Warning", color: "#FBBF24" },
  { value: "Success", label: "Success", color: "#10B981" },
  { value: "Error", label: "Error", color: "#F43F5E" },
  { value: "Verification Pending", label: "Verification Pending", color: "#3B82F6" },
];

const STATUS_COLORS = {
  "Not Started": "bg-gray-200 text-gray-800",
  "In Progress": "bg-amber-400 text-white",
  "Warning": "bg-yellow-400 text-white",
  "Success": "bg-green-600 text-white",
  "Error": "bg-red-600 text-white",
  "Verification Pending": "bg-[rgb(59,130,246)] text-white",
};

const PAGE_SIZE = 50;

function getFileExtension(fileName) {
  if (!fileName) return "";
  return fileName.split(".").pop().toLowerCase();
}

function getImage(type) {
  switch (type) {
    case "csv":
      return csvIcon;
    case "pdf":
      return pdfIcon;
    case "xls":
      return xlsIcon;
    case "xlsx":
      return xlsxIcon;
    default:
      return csvIcon;
  }
}

function getInitials(firstName, lastName) {
  if (!firstName && !lastName) return "";
  const firstInitial = firstName ? firstName[0] : "";
  const lastInitial = lastName ? lastName[0] : "";
  return (firstInitial + lastInitial).toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
}

function formatDateWithTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("en-US") +
    " " +
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

const repColorCodes = [
  "#3B82F6", "#F59E42", "#10B981", "#F43F5E", "#6366F1", "#FBBF24", "#22D3EE",
];

const FileHistory = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState<'table' | 'card'>('table');
  const [isLoading, setIsLoading] = useState(false);
  const [gridData, setGridData] = useState([]);
  const [total, setTotal] = useState(0);
  const [columnWidths, setColumnWidths] = useState({
    Edit: 80,
    ImportName: 200,
    DocTypeName: 150,
    CreateDate: 160,
    UserName: 150,
    Type: 80,
    UpdateDate: 150,
    Status: 120,
    Action: 100
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    message: "",
    onConfirm: () => {},
    onReject: () => {}
  });

  const { toast } = useToast();
  const { sortedData, sortState, handleSort } = useTableSort(gridData, {
    column: "UpdateDate",
    direction: "desc"
  });

  // Fetch data
  const fetchData = useCallback(() => {
    setIsLoading(true);
    preflightService.getAllPreflightFiles(
      (currentPage - 1) * PAGE_SIZE,
      `${sortState.column} ${sortState.direction}`,
      statusFilter,
      searchValue.length >= 3 ? searchValue : ""
    )
      .then((resp: any) => {
        setGridData(resp.List || []);
        setTotal(resp.Count || 0);
        setIsLoading(false);
      })
      .catch(() => {
        setGridData([]);
        setTotal(0);
        setIsLoading(false);
      });
  }, [currentPage, sortState, statusFilter, searchValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle column resize
  const handleColumnResize = (column: string, width: number) => {
    // Map the column names to match our state keys
    const columnMap: { [key: string]: string } = {
      'ImportName': 'ImportName',
      'DocTypeName': 'DocTypeName', 
      'CreateDate': 'CreateDate',
      'User.Name': 'UserName',
      'UpdateDate': 'UpdateDate',
      'Status': 'Status'
    };
    
    const stateKey = columnMap[column] || column;
    setColumnWidths(prev => ({
      ...prev,
      [stateKey]: width
    }));
  };

  // Helper function to convert JSON to CSV
  const convertToCSV = (jsonData) => {
    if (!jsonData || jsonData.length === 0) return '';
    
    const headers = Object.keys(jsonData[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of jsonData) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quote
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  // Helper function to get sort and filter query
  const getSortFilterQuery = () => {
    return `${sortState.column} ${sortState.direction}`;
  };

  // Helper function to get grid data
  const getGridData = async (data) => {
    return data || [];
  };

  // Show confirmation dialog using AlertDialog
  const showConfirm = ({ message }) => {
    return new Promise((resolve) => {
      setConfirmDialogConfig({
        message: message,
        onConfirm: () => {
          setShowConfirmDialog(false);
          resolve(true);
        },
        onReject: () => {
          setShowConfirmDialog(false);
          resolve(false);
        }
      });
      setShowConfirmDialog(true);
    });
  };

  // Show success message using toaster
  const showSuccess = ({ message }) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  // Show alert message using toaster
  const showAlert = ({ message }) => {
    toast({
      title: "Alert",
      description: message,
      variant: "destructive"
    });
  };

  // Delete handler
  const handleDelete = (fileItem) => {
    const handleDeleteIconClick = (e, id) => {
      e.stopPropagation();
      showConfirm({ message: "Are you sure you want to delete?" }).then(
        (isOk) => {
          if (isOk) {
            setIsLoading(true);
            preflightService
              .deletePreflightFile(
                id,
                true,
                (currentPage - 1) * PAGE_SIZE,
                getSortFilterQuery(),
                statusFilter,
                searchValue.length >= 3 ? searchValue : ""
              )
              .then(async (resp: any) => {
                if (resp?.content?.Status === "Success") {
                  showSuccess({ message: "File deleted successfully" });
                  const result = await getGridData(resp.content.Data.List);
                  setTotal(resp.content.Data.Count);
                  setGridData(result);
                } else {
                  showAlert({
                    message: "Unable to delete the preflight import file",
                  });
                  setGridData([]);
                }
                setIsLoading(false);
              })
              .catch((err) => {
                setIsLoading(false);
                console.log(err);
              });
          }
        }
      );
    };

    handleDeleteIconClick({ stopPropagation: () => {} }, fileItem.PreflightFileID);
  };

  // Download handler
  const handleDownload = (fileItem) => {
    const downloadFile = (
      id,
      importName,
      fileName,
      excludeSystemColumns = false
    ) => {
      setIsLoading(true);
      preflightService
        .getPreflightImportLogs(id, -1, -1, excludeSystemColumns, "Download", "All", "")
        .then(function (res: any) {
          if (res?.content?.Status === "Success" && res?.content?.Data?.Result) {
            let jsonData = JSON.parse(res?.content?.Data?.Result);
            const extension = getFileExtension(fileName);
            let wb, ws, blob, link;
            switch (extension) {
              case "csv":
                const csv = convertToCSV(jsonData);
                blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                break;
              case "xls":
                wb = XLSX.utils.book_new();
                ws = XLSX.utils.json_to_sheet(jsonData);
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                blob = new Blob(
                  [XLSX.write(wb, { bookType: "xls", type: "array" })],
                  {
                    type: "application/vnd.ms-excel",
                  }
                );
                break;
              case "xlsx":
                wb = XLSX.utils.book_new();
                ws = XLSX.utils.json_to_sheet(jsonData);
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                blob = new Blob(
                  [XLSX.write(wb, { bookType: "xlsx", type: "array" })],
                  {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  }
                );
                break;
              default:
                showAlert({ message: "Unsupported file format" });
                setIsLoading(false);
                return;
            }

            // Create download link and trigger download
            link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = importName ?? fileName;
            link.click();
            
            // Saving the history
            const payload = {
              FileID: id,
              Action: "File has been downloaded",
              Description: "File has been downloaded",
              Source: "DataPreflight", // You may need to import this constant
            };
            preflightService.saveHistory(payload);
          } else {
            showAlert({ message: "Unable to fetch the data" });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err);
        });
    };

    downloadFile(
      fileItem.PreflightFileID,
      fileItem.ImportName,
      fileItem.FileName,
      false
    );
  };

  const handleEdit = (fileItem) => {
    // TODO: Replace with your edit modal logic
    console.log('File Item Details:', JSON.stringify(fileItem, null, 2));
    alert(`Edit: ${JSON.stringify(fileItem, null, 2)}`);
  };

  const filterOptions = {
    dropdown1: {
      label: "Status",
      options: STATUS_OPTIONS,
      value: statusFilter,
      onSelect: setStatusFilter
    }
  };

  if (activeView === 'card') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header currentPage="file-history" />
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between mb-2 w-full">
            <div className="flex-1 flex items-center">
              <TableFilters
                searchTerm={searchValue}
                onSearchChange={setSearchValue}
                activeView={activeView}
                onViewChange={setActiveView}
                onRefresh={fetchData}
                filterOptions={filterOptions}
                hideActions={true}
              />
            </div>
            <div className="flex-1 flex justify-end items-center">
              <TableFilters
                searchTerm={searchValue}
                onSearchChange={setSearchValue}
                activeView={activeView}
                onViewChange={setActiveView}
                onRefresh={fetchData}
                filterOptions={undefined}
                hideFilters={true}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {sortedData.map((item) => (
              <div key={item.PreflightFileID} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{item.ImportName}</h3>
                  <img
                    className="w-8 h-8 rounded shadow border border-purple-100 bg-white"
                    src={getImage(getFileExtension(item.FileName))}
                    alt="File Type"
                    title={getFileExtension(item.FileName).toUpperCase()}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {item.DocTypeName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Created:</span> {formatDate(item.CreateDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Modified:</span> {formatDateWithTime(item.UpdateDate)}
                  </p>
                  <div className="flex items-center gap-2">
                    <NameBubble
                      initials={getInitials(item.User?.FirstName, item.User?.LastName)}
                      bgColor={repColorCodes[Math.floor(Math.random() * repColorCodes.length)]}
                      hideName={true}
                      allNames={item.User?.Name}
                    />
                    <span className="text-sm text-gray-600">{item.User?.Name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        STATUS_COLORS[item.Status] || "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {item.Status}
                    </div>
                    <div className="flex gap-2">
                      {item.TableName ? (
                        <BiDownload
                          className="text-xl cursor-pointer text-[rgb(59,130,246)] hover:text-[rgb(37,99,235)] transition-colors"
                          title="Download File"
                          onClick={() => handleDownload(item)}
                        />
                      ) : (
                        <BiDownload
                          className="text-xl opacity-50 cursor-not-allowed"
                          title="No file data to download"
                        />
                      )}
                      <img
                        src={deleteIcon}
                        alt="Delete File"
                        title="Delete File"
                        className="w-5 h-5 cursor-pointer hover:scale-110 hover:bg-[rgb(59,130,246,0.1)] rounded transition-transform"
                        onClick={() => handleDelete(item)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header currentPage="file-history" />
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between mb-2 w-full">
          <div className="flex-1 flex items-center">
            {/* Left: Status Dropdown (filters) */}
            <TableFilters
              searchTerm={searchValue}
              onSearchChange={setSearchValue}
              activeView={activeView}
              onViewChange={setActiveView}
              onRefresh={fetchData}
              filterOptions={filterOptions}
              hideActions={true}
            />
          </div>
          <div className="flex-1 flex justify-center">
            <PagerTop
              pageSize={PAGE_SIZE}
              currentPageIndex={currentPage}
              currentPageTotal={gridData.length}
              total={total}
              handlePageIndexChange={setCurrentPage}
            />
          </div>
          <div className="flex-1 flex justify-end items-center">
            {/* Right: Actions (refresh, view toggle, search) */}
            <TableFilters
              searchTerm={searchValue}
              onSearchChange={setSearchValue}
              activeView={activeView}
              onViewChange={setActiveView}
              onRefresh={fetchData}
              filterOptions={undefined}
              hideFilters={true}
            />
          </div>
        </div>
        <div className="opportunities-table-container">
          <table className="opportunities-table">
            <thead className="table-header">
              <tr className="table-header-row">
                <th 
                  className="table-header-cell text-center"
                  style={{ width: `${columnWidths.Edit}px`, minWidth: `${columnWidths.Edit}px` }}
                >
                  Edit
                </th>
                <ResizableTableHeader
                  column="ImportName"
                  currentSort={sortState}
                  onSort={handleSort}
                  defaultWidth={columnWidths.ImportName}
                  minWidth={120}
                  onResize={handleColumnResize}
                >
                  Name
                </ResizableTableHeader>
                <ResizableTableHeader
                  column="DocTypeName"
                  currentSort={sortState}
                  onSort={handleSort}
                  defaultWidth={columnWidths.DocTypeName}
                  minWidth={100}
                  onResize={handleColumnResize}
                >
                  Doc Type
                </ResizableTableHeader>
                <ResizableTableHeader
                  column="CreateDate"
                  currentSort={sortState}
                  onSort={handleSort}
                  defaultWidth={columnWidths.CreateDate}
                  minWidth={120}
                  onResize={handleColumnResize}
                >
                  Created On
                </ResizableTableHeader>
                <ResizableTableHeader
                  column="User.Name"
                  currentSort={sortState}
                  onSort={handleSort}
                  defaultWidth={columnWidths.UserName}
                  minWidth={120}
                  onResize={handleColumnResize}
                >
                  Created By
                </ResizableTableHeader>
                <th 
                  className="table-header-cell text-center"
                  style={{ width: `${columnWidths.Type}px`, minWidth: `${columnWidths.Type}px` }}
                >
                  Type
                </th>
                <ResizableTableHeader
                  column="UpdateDate"
                  currentSort={sortState}
                  onSort={handleSort}
                  defaultWidth={columnWidths.UpdateDate}
                  minWidth={120}
                  onResize={handleColumnResize}
                >
                  Modified On
                </ResizableTableHeader>
                <ResizableTableHeader
                  column="Status"
                  currentSort={sortState}
                  onSort={handleSort}
                  defaultWidth={columnWidths.Status}
                  minWidth={100}
                  onResize={handleColumnResize}
                >
                  Status
                </ResizableTableHeader>
                <th 
                  className="table-header-cell text-center"
                  style={{ width: `${columnWidths.Action}px`, minWidth: `${columnWidths.Action}px` }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="table-body-scroll-area">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(59,130,246)]"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                sortedData.map((fileItem) => (
                  <tr key={fileItem.PreflightFileID} className="table-row">
                    <td 
                      className="table-cell text-center"
                      style={{ width: `${columnWidths.Edit}px`, minWidth: `${columnWidths.Edit}px` }}
                    >
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(fileItem)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                    </td>
                    <td 
                      className="table-cell"
                      style={{ width: `${columnWidths.ImportName}px`, minWidth: `${columnWidths.ImportName}px` }}
                      title={fileItem.ImportName}
                    >
                      <span className="opportunity-link">{fileItem.ImportName}</span>
                    </td>
                    <td 
                      className="table-cell"
                      style={{ width: `${columnWidths.DocTypeName}px`, minWidth: `${columnWidths.DocTypeName}px` }}
                      title={fileItem.DocTypeName}
                    >
                      {fileItem.DocTypeName}
                    </td>
                    <td 
                      className="table-cell"
                      style={{ width: `${columnWidths.CreateDate}px`, minWidth: `${columnWidths.CreateDate}px` }}
                      title={formatDate(fileItem.CreateDate)}
                    >
                      {formatDate(fileItem.CreateDate)}
                    </td>
                    <td 
                      className="table-cell"
                      style={{ width: `${columnWidths.UserName}px`, minWidth: `${columnWidths.UserName}px` }}
                      title={fileItem.User?.Name}
                    >
                      <div className="flex items-center gap-2">
                        <NameBubble
                          initials={getInitials(fileItem.User?.FirstName, fileItem.User?.LastName)}
                          bgColor={repColorCodes[Math.floor(Math.random() * repColorCodes.length)]}
                          hideName={true}
                          allNames={fileItem.User?.Name}
                        />
                        <span className="company-link">{fileItem.User?.Name}</span>
                      </div>
                    </td>
                    <td 
                      className="table-cell text-center"
                      style={{ width: `${columnWidths.Type}px`, minWidth: `${columnWidths.Type}px` }}
                      title={getFileExtension(fileItem.FileName).toUpperCase()}
                    >
                      <img
                        className="w-7 h-7 mx-auto rounded shadow border border-purple-100 bg-white"
                        src={getImage(getFileExtension(fileItem.FileName))}
                        alt="File Type"
                      />
                    </td>
                    <td 
                      className="table-cell"
                      style={{ width: `${columnWidths.UpdateDate}px`, minWidth: `${columnWidths.UpdateDate}px` }}
                      title={formatDateWithTime(fileItem.UpdateDate)}
                    >
                      {formatDateWithTime(fileItem.UpdateDate)}
                    </td>
                    <td 
                      className="table-cell"
                      style={{ width: `${columnWidths.Status}px`, minWidth: `${columnWidths.Status}px` }}
                      title={fileItem.Status}
                    >
                      <div
                        className={`status-badge ${
                          STATUS_COLORS[fileItem.Status] || "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {fileItem.Status}
                      </div>
                    </td>
                    <td 
                      className="table-cell text-center"
                      style={{ width: `${columnWidths.Action}px`, minWidth: `${columnWidths.Action}px` }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {fileItem.TableName ? (
                          <BiDownload
                            className="text-xl cursor-pointer text-[rgb(59,130,246)] hover:text-[rgb(37,99,235)] transition-colors"
                            title="Download File"
                            onClick={() => handleDownload(fileItem)}
                          />
                        ) : (
                          <BiDownload
                            className="text-xl opacity-50 cursor-not-allowed"
                            title="No file data to download"
                          />
                        )}
                        <img
                          src={deleteIcon}
                          alt="Delete File"
                          title="Delete File"
                          className="w-5 h-5 cursor-pointer hover:scale-110 hover:bg-[rgb(59,130,246,0.1)] rounded transition-transform"
                          onClick={() => handleDelete(fileItem)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialogConfig.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={confirmDialogConfig.onReject}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialogConfig.onConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FileHistory;