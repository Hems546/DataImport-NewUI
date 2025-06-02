import React, { useEffect, useState, useCallback } from "react";
import { preflightService } from "@/services/preflightService";
import Header from "@/components/Header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/SortableHeader";
import TableFilters from "@/components/TableFilters";
import NameBubble from "../components/NameBubble";
import { BiDownload } from "react-icons/bi";
import deleteIcon from "@/assets/deleteIcon.svg";
import csvIcon from "@/assets/csvIcon.svg";
import xlsIcon from "@/assets/xlsIcon.svg";
import xlsxIcon from "@/assets/xlsxIcon.svg";
import pdfIcon from "@/assets/pdfIcon.svg";
import "@/styles/table.css";

const STATUS_OPTIONS = [
  { value: "All", label: "Show All Imports" },
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress", label: "In Progress" },
  { value: "Warning", label: "Warning" },
  { value: "Success", label: "Success" },
  { value: "Error", label: "Error" },
  { value: "Verification Pending", label: "Verification Pending" },
];

const STATUS_COLORS = {
  "Not Started": "bg-gray-200 text-gray-800",
  "In Progress": "bg-amber-400 text-white",
  "Warning": "bg-yellow-400 text-white",
  "Success": "bg-green-600 text-white",
  "Error": "bg-red-600 text-white",
  "Verification Pending": "bg-purple-400 text-white",
};

const PAGE_SIZE = 20;

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

  // Paging handler
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Download handler (stub)
  const handleDownload = (fileItem) => {
    // Implement your download logic here
    alert(`Download: ${fileItem.FileName}`);
  };

  // Delete handler (stub)
  const handleDelete = (fileItem) => {
    // Implement your delete logic here
    alert(`Delete: ${fileItem.FileName}`);
  };

  const filterOptions = {
    dropdown1: {
      label: "Status",
      options: STATUS_OPTIONS
    },
    dropdown2: {
      label: "Type",
      options: [
        { value: "all", label: "All Types" },
        { value: "csv", label: "CSV" },
        { value: "xls", label: "XLS" },
        { value: "xlsx", label: "XLSX" },
        { value: "pdf", label: "PDF" }
      ]
    },
    dropdown3: {
      label: "Category",
      options: [
        { value: "all", label: "All Categories" },
        { value: "import", label: "Import" },
        { value: "export", label: "Export" }
      ]
    }
  };

  if (activeView === 'card') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header currentPage="file-history" />
        <div className="container mx-auto px-4 py-8">
          <TableFilters
            searchTerm={searchValue}
            onSearchChange={setSearchValue}
            activeView={activeView}
            onViewChange={setActiveView}
            onRefresh={fetchData}
            filterOptions={filterOptions}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {sortedData.map((item) => (
              <div key={item.PreflightFileID} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{item.ImportName}</h3>
                  <img
                    className="w-8 h-8 rounded shadow border border-purple-100 bg-white"
                    src={getImage(getFileExtension(item.FileName))}
                    alt="File Type"
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
                          className="text-xl cursor-pointer text-purple-500 hover:text-purple-700 transition-colors"
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
                        className="w-5 h-5 cursor-pointer hover:scale-110 hover:bg-purple-100 rounded transition-transform"
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
      <div className="container mx-auto px-4 py-8">
        <TableFilters
          searchTerm={searchValue}
          onSearchChange={setSearchValue}
          activeView={activeView}
          onViewChange={setActiveView}
          onRefresh={fetchData}
          filterOptions={filterOptions}
        />
        
        <div className="opportunities-table-container">
          <div className="table-scroll-area">
            <table className="opportunities-table">
              <thead className="table-header">
                <tr className="table-header-row">
                  <SortableHeader
                    column="ImportName"
                    currentSort={sortState}
                    onSort={handleSort}
                  >
                    Name
                  </SortableHeader>
                  <SortableHeader
                    column="DocTypeName"
                    currentSort={sortState}
                    onSort={handleSort}
                  >
                    Doc Type
                  </SortableHeader>
                  <SortableHeader
                    column="CreateDate"
                    currentSort={sortState}
                    onSort={handleSort}
                  >
                    Created
                  </SortableHeader>
                  <SortableHeader
                    column="User.Name"
                    currentSort={sortState}
                    onSort={handleSort}
                  >
                    By
                  </SortableHeader>
                  <th className="table-header-cell text-center">Type</th>
                  <SortableHeader
                    column="UpdateDate"
                    currentSort={sortState}
                    onSort={handleSort}
                  >
                    Modified
                  </SortableHeader>
                  <SortableHeader
                    column="Status"
                    currentSort={sortState}
                    onSort={handleSort}
                  >
                    Status
                  </SortableHeader>
                  <th className="table-header-cell text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                      <td className="table-cell">
                        <span className="opportunity-link">{fileItem.ImportName}</span>
                      </td>
                      <td className="table-cell">{fileItem.DocTypeName}</td>
                      <td className="table-cell">{formatDate(fileItem.CreateDate)}</td>
                      <td className="table-cell">
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
                      <td className="table-cell text-center">
                        <img
                          className="w-7 h-7 mx-auto rounded shadow border border-purple-100 bg-white"
                          src={getImage(getFileExtension(fileItem.FileName))}
                          alt="File Type"
                        />
                      </td>
                      <td className="table-cell">{formatDateWithTime(fileItem.UpdateDate)}</td>
                      <td className="table-cell">
                        <div
                          className={`status-badge ${
                            STATUS_COLORS[fileItem.Status] || "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {fileItem.Status}
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <div className="flex items-center justify-center gap-2">
                          {fileItem.TableName ? (
                            <BiDownload
                              className="text-xl cursor-pointer text-purple-500 hover:text-purple-700 transition-colors"
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
                            className="w-5 h-5 cursor-pointer hover:scale-110 hover:bg-purple-100 rounded transition-transform"
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
          <div className="table-footer">
            <div className="table-footer-text">
              Showing {sortedData.length} of {total} records
            </div>
            <div className="pagination-controls">
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileHistory;
