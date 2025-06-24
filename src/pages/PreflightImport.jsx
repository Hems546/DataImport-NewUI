import React, { useEffect, useState, useRef } from "react";
import preflightService from "../../services/PreflightImport/preflightService";
import "./css/PreflightStyles.scss";
import PreflightFile from "./PreflightFile";
import Grid from "../../components/GridGrouping";
import csvIcon from "../../images/csv2024.svg";
import pdfIcon from "../../images/pdf80.png";
import xlsIcon from "../../images/xls2024.svg";
import xlsxIcon from "../../images/xlsx2024.svg";
import { BiDownload } from "react-icons/bi";
import { FaPlusCircle } from "react-icons/fa";
import { MdSearch, MdClose } from "react-icons/md";
import refreshButton from "../../images/refresh-button.svg";
import NameBubble from "../Users/List/utils/Namebubble";
import deleteIcon from "../../images/icon-delete-orders.svg";
import {
  enumStatusColor,
  convertToCSV,
  defaultPagerData,
  initialSortState,
  preflightStatus,
  ImportFilesInfoText,
  fixedWidthColumns,
  preflightActionType,
  nonResizableColumns
} from "./utils/helpers";
import SidePanel from "../../shared/SidePanel";
import { showConfirm, showAlert, showSuccess } from "../../shared/ConfirmPopup";
import PagerTop from "../../shared/Pager/index";
import {
  repColorCodes,
  formatDate,
  getFileExtension,
  formatDateWithTime,
} from "../../utilities/commonHelpers";
import * as XLSX from "xlsx";
import Loading from "../../shared/Loading";
import AssistantServices from "../OpenAI/Services/AssistantServices";
import StatusDropdown from "./StatusDropdown";

function PreflightImport(props) {
  const { isFromPreflightFile = false } = props;
  const [openPreflightFile, setOpenPreflightFile] = useState();
  const [gridData, setGridData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [docType, setDoctype] = useState({});
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [editDetails, setEditDetails] = useState({});
  const [pagerData, setPagerData] = useState(defaultPagerData);
  const [sortFilter, setSortFilter] = useState(initialSortState);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filter, setFilter] = useState("All");
  const [aiPrompts, setAIPrompts] = useState([]);
  const [pageLoad, setPageLoad] = useState({
    IsLoading: false,
    LoadingText: "Loading",
  });
  const tableRef = useRef();
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    getAIPrompts();
  }, []);

  useEffect(() => {
    getPreflightFiles();
  }, [sortFilter, pagerData.currentPageIndex, refresh]);

  function getHeaders() {
    if (!headers.length) {
      setHeaders([
        { accessor: "EDIT", Header: "" },
        { accessor: "ImportName", Header: "Name" },
        { accessor: "DocTypeName", Header: "Doc Type" },
        { accessor: "CreateDate", Header: "Created Date" },
        { accessor: "CreatedByWithBubble", Header: "Created By" },
        { accessor: "FileType", Header: "File Type" },
        { accessor: "UpdateDate", Header: "Last Modified Date" },
        { accessor: "StatusWithColor", Header: "Status" },
        { accessor: "Action", Header: "" },
      ]);
    }
  }

  const getPreflightFiles = () => {
    if (!headers.length) {
      getHeaders();
    }

    preflightService()
      .getAllPreflightFiles(
        (pagerData.currentPageIndex - 1) * pagerData.pageSize,
        getSortFilterQuery(),
        filter,
        searchValue.length >= 3 ? searchValue : ""
      )
      .then(async (resp) => {
        if (!isFromPreflightFile && isFirstVisit) {
          setIsFirstVisit(false);
          if (!resp?.HasExistingImports) {
            setOpenPreflightFile(true);
            return;
          }
        }

        if (resp?.Count > 0) {
          const result = await getGridData(resp.List);
          setPagerData({
            ...pagerData,
            total: resp.Count,
            currentPageTotal: resp.List.length,
          });
          setGridData(result);
        } else {
          setGridData([]);
        }
        setIsLoading(false);
        setPageLoad((prev) => {
          return {
            ...prev,
            isLoading: false,
          };
        });
      })
      .catch((err) => {
        setIsLoading(false);
        setGridData([]);
        console.log(err);
        setPageLoad((prev) => {
          return {
            ...prev,
            isLoading: false,
          };
        });
      });
  };

  const getSortFilterQuery = () => {
    let sortFilterQuery = "[UpdateDate] DESC";
    if (sortFilter.ColumnName) {
      sortFilterQuery = `${sortFilter.ColumnName} ${sortFilter.Direction}`;
    }
    return sortFilterQuery;
  };

  const getAIPrompts = () => {
    AssistantServices()
      .getOpenAIPrompts("PreflightAssistant")
      .then((promptResult) => {
        if (promptResult?.length > 0) {
          setAIPrompts(promptResult);
        }
      });
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) {
      return "";
    }
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    return firstInitial.toUpperCase() + lastInitial.toUpperCase();
  };

  const getImage = (type) => {
    let icon = "";
    switch (type) {
      case "csv":
        icon = csvIcon;
        break;
      case "pdf":
        icon = pdfIcon;
        break;
      case "xls":
        icon = xlsIcon;
        break;
      case "xlsx":
        icon = xlsxIcon;
        break;
    }
    return icon;
  };

  function getGridData(resp) {
    const result = resp.map((fileItem, index) => {
      return {
        ...fileItem,
        CreatedByWithBubble: (
          <NameBubble
            initials={getInitials(
              fileItem.User?.FirstName,
              fileItem.User?.LastName
            )}
            bgColor={repColorCodes[index % repColorCodes.length]}
            hideName={true}
            allNames={fileItem.User?.Name}
          ></NameBubble>
        ),
        CreateDate: formatDate(fileItem.CreateDate),
        FileType: fileItem.FileName && fileItem.FileName !== "" && (
          <div>
            <img
              className="csv-file-img"
              src={getImage(getFileExtension(fileItem.FileName))}
              alt="File Type"
            />
          </div>
        ),
        UpdateDate: formatDateWithTime(fileItem.UpdateDate),
        StatusWithColor: (
          <div
            title={fileItem.Status}
            className="statusColor"
            style={{ backgroundColor: enumStatusColor[fileItem.Status] }}
          >
            {fileItem.Status}
          </div>
        ),
        Action: (
          <div className="grid-actions">
            {fileItem.TableName ? (
              <BiDownload
                title="Download File"
                onClick={() =>
                  downloadFile(
                    fileItem.PreflightFileID,
                    fileItem.ImportName,
                    fileItem.FileName,
                    true
                  )
                }
              />
            ) : (
              <BiDownload
                style={{ opacity: 0.5, cursor: "not-allowed" }}
                title="No file data to download"
              />
            )} {" "}
            <img
              src={deleteIcon}
              alt="Delete File"
              title="Delete File"
              className="ml-2"
              onClick={(e) =>
                handleDeleteIconClick(e, fileItem.PreflightFileID)
              }
            />
          </div>
        ),
      };
    });
    return result;
  }

  function downloadFile(
    id,
    importName,
    fileName,
    excludeSystemColumns = false
  ) {
    setPageLoad((prev) => {
      return {
        ...prev,
        LoadingText: "Data is being downloaded, please wait...",
        isLoading: true,
      };
    });
    preflightService()
      .getPreflightImportLogs(id, -1, -1, excludeSystemColumns, "Download")
      .then(function (res) {
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
              return;
          }

          // Create download link and trigger download
          link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = importName ?? fileName;
          link.click();
          //saving the history
          const payload = {
            FileID: id,
            Action: "File has been downlaoded",
            Description: "File has been downlaoded",
            Source: preflightActionType.DataPreflight,
          };
          preflightService().saveHistory(payload);
        } else {
          showAlert({ message: "Unable to fetch the data" });
        }
        setPageLoad((prev) => {
          return {
            ...prev,
            LoadingText: "Loading",
            isLoading: false,
          };
        });
      });
  }

  function handleDeleteIconClick(e, id) {
    e.stopPropagation();
    showConfirm({ message: "Are you sure you want to delete?" }).then(
      (isOk) => {
        if (isOk) {
          setIsLoading(true);
          preflightService()
            .deletePreflightFile(
              id,
              true,
              (pagerData.currentPageIndex - 1) * pagerData.pageSize,
              getSortFilterQuery(),
              filter,
              searchValue.length >= 3 ? searchValue : ""
            )
            .then(async (resp) => {
              if (resp?.content?.Status === "Success") {
                showSuccess({ message: "File deleted successfully" });
                const result = await getGridData(resp.content.Data.List);
                setPagerData({
                  ...pagerData,
                  total: resp.content.Data.Count,
                  currentPageTotal: resp.content.Data.List.length,
                });
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
  }

  //handle refresh
  const handleRefreshClick = () => {
    setIsLoading(true);
    setSortFilter(initialSortState);
    setPagerData(defaultPagerData);
    setSearchValue("");
    setFilter("All");
    setRefresh(!refresh);
  };

  function searchHandler(searchInput) {
    if (gridData) {
      setSearchValue(searchInput);
      if (searchInput.length >= 3 || searchInput.length === 0) {
        setPagerData({ ...defaultPagerData });
        setIsLoading(true);
        setRefresh(!refresh);
      }
    }
  }

  const sidePanelAction = () => {
    setShowSidePanel(!showSidePanel);
  };

  const handleStatusSelect = (value) => {
    setIsLoading(true);
    setPagerData(defaultPagerData);
    setFilter(value);
    setRefresh(!refresh);
  };

  return (
    <>
      {pageLoad.isLoading && <Loading loadingText={pageLoad.LoadingText} />}
      {!openPreflightFile && (
        <div className="import-preflight m-2 preflight-data-title">
          <div className="flex full-width mb-2 items-center">
            <div
              className="flex justify-space-between items-center"
              style={{ width: "55%" }}
            >
              <div className="flex mb-2">
                <div className="row">
                  <h2>
                    <b>Preflight Files</b>
                  </h2>
                  <span
                    className="label-info-icon field-info-icon info-data-title"
                    onClick={sidePanelAction}
                    data-title="Click here to view Data Preflight Guidelines"
                  ></span>
                </div>
                <div className="row ml-3">
                  <span
                    className="btn-blue-borders pr-2 cursor-pointer"
                    onClick={() => setOpenPreflightFile(true)}
                  >
                    <FaPlusCircle
                      className="plus-symbol"
                      alt="Import File Type"
                    />
                  </span>
                  <span
                    className="cursor-pointer"
                    onClick={() => setOpenPreflightFile(true)}
                  >
                    Start New Import
                  </span>
                </div>
              </div>
              <div className="paging-top preflight-pager row ml-0 mb-2">
                <PagerTop
                  pageSize={pagerData.pageSize}
                  currentPageIndex={pagerData.currentPageIndex}
                  currentPageTotal={pagerData.currentPageTotal}
                  total={pagerData.total}
                  refreshData={handleRefreshClick}
                  handlePageIndexChange={(nextIndex) => {
                    if (
                      nextIndex != pagerData.currentPageIndex &&
                      nextIndex > 0
                    ) {
                      setPageLoad((prev) => {
                        return {
                          ...prev,
                          isLoading: true,
                        };
                      });
                      setPagerData({
                        ...pagerData,
                        currentPageIndex: nextIndex,
                        isPageIndexChanged: true,
                      });
                    }
                  }}
                />
              </div>
            </div>
            <div
              className="preflight-grid-actions"
              style={{ width: "55%", gap: "15px" }}
            >
              <div className="right-action-items">
                <div
                  className="action-icons-border row refresh-icon-data-title"
                  data-title="Refresh"
                  onClick={handleRefreshClick}
                >
                  <img src={refreshButton} alt="Refresh" />
                </div>
                <div className="row">
                  <StatusDropdown
                    options={preflightStatus}
                    defaultText={
                      preflightStatus.find((x) => x.value === filter)?.label ||
                      "Show All Imports"
                    }
                    onSelect={handleStatusSelect}
                    outerStyles={{ width: "180px" }}
                    value={filter}
                  />
                </div>

                <div className="row">
                  <input
                    type="text"
                    id="txtPreflightFileSearch"
                    className="searchText"
                    placeholder="Search"
                    onChange={(e) => {
                      searchHandler(e.target.value);
                    }}
                    value={searchValue}
                    maxLength="200"
                  />
                  {searchValue.length > 0 ? (
                    <span
                      className="close-search-icon pointer"
                      onClick={handleRefreshClick}
                    >
                      <MdClose />
                    </span>
                  ) : (
                    <span className="input-search-icon">
                      <MdSearch />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div ref={tableRef} className="preflight-import-files-grid">
            <Grid
              columnHeaders={headers}
              gridData={gridData}
              isLoading={isLoading}
              ref={tableRef}
              nonSortingColumns={["FileType", "Action"]}
              handleEdit={() => {}}
              isAutoAdjustWidth={true}
              fixedWidthColumns={fixedWidthColumns}
              nonResizableColumns={nonResizableColumns}
            />
          </div>
        </div>
      )}
      {openPreflightFile && (
        <div>
          <PreflightFile
            docType={docType}
            editDetails={editDetails}
            aiPrompts={aiPrompts}
            handleDownload={downloadFile}
          />
        </div>
      )}
      {showSidePanel && (
        <SidePanel
          isMouseOutClose={false}
          style={{ width: "50%" }}
          onClose={sidePanelAction}
          title="Data Preflight Guidelines"
          customButton={[
            {
              label: "Close",
              type: "primary",
              buttonFunction: sidePanelAction,
            },
          ]}
        >
          <div className="info-text">
            <div dangerouslySetInnerHTML={{ __html: ImportFilesInfoText }} />
          </div>
        </SidePanel>
      )}
    </>
  );
}

export default PreflightImport; 