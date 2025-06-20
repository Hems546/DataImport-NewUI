import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Toggle } from "@/components/ui/toggle";
import { preflightService } from "@/services/preflightService";
import { enumStatusColor, InfoInstructions } from "@/constants/importHelpers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  FileBox,
  ClipboardCheck,
  ArrowUpCircle,
  Edit,
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  User, 
  MapPin
} from "lucide-react";
import MapColumns from "@/components/icons/MapColumns";
import DataQuality from "@/components/icons/DataQuality";
import TransformData from "@/components/icons/TransformData";
import ProgressStep from "@/components/ProgressStep";
import StepConnector from "@/components/StepConnector";
import ValidationStatus, { ValidationResult } from '@/components/ValidationStatus';
import NormalizationEditor, { NormalizationIssue } from '@/components/NormalizationEditor';

export default function DataNormalization() {
  const { toast } = useToast();
  
  // Normalization States
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [normalizationResults, setNormalizationResults] = useState<ValidationResult[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [normalizationIssues, setNormalizationIssues] = useState<Record<string, NormalizationIssue[]>>({});

  // Data Verification States
  const [preflightFileID, setPreflightFileID] = useState<number | null>(null);
  const [preflightFileInfo, setPreflightFileInfo] = useState({
    PreflightFileID: 0,
    DataVerificationStatus: "Not Started",
    DataSummary: "",
    Status: "Not Started"
  });
  const [dataVerificationOptions, setDataVerificationOptions] = useState({
    IsFullNameExists: false,
    IsFullAddressExists: false,
    IsEmailExists: false,
    IsFullNameValidated: false,
    IsAddressValidated: false,
    IsEmailValidated: false,
  });
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [summaryEnabled, setSummaryEnabled] = useState(false);
  const [pageLoad, setPageLoad] = useState({
    IsLoading: false,
    LoadingText: ""
  });

  // Data Verification useEffect
  useEffect(() => {
    // Get preflightFileID from localStorage
    const storedPreflightFileID = localStorage.getItem('preflightFileID');
    if (storedPreflightFileID) {
      const fileID = parseInt(storedPreflightFileID);
      setPreflightFileID(fileID);
      setPreflightFileInfo(prev => ({
        ...prev,
        PreflightFileID: fileID
      }));
      getDataVerificationOptions(fileID);
    } else {
      toast({
        title: "Warning",
        description: "No preflight file ID found. Data verification features may not be available.",
        variant: "warning"
      });
    }
  }, []);

  // Data Verification Functions
  const getDataVerificationOptions = (preflightFileID: number) => {
    setIsInitialLoading(true);
    return new Promise((resolve, reject) => {
      preflightService
        .getDataVerificationOptions(preflightFileID)
        .then((resp: any) => {
          if (resp?.content?.Data) {
            setDataVerificationOptions(resp.content.Data);
          }
          resolve(resp);
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error ? error : "Unable to fetch Data Verification details please contact admin.",
            variant: "destructive"
          });
          console.log(error);
          reject(error);
        })
        .finally(() => {
          setIsInitialLoading(false);
        });
    });
  };

  const preflightDataVerificationUpdate = async (actionType: string) => {
    if (!preflightFileID) {
      toast({
        title: "Error",
        description: "No preflight file ID available.",
        variant: "destructive"
      });
      return;
    }

    let isError = false;
    let message = "";
    setPageLoad((prev) => {
      return {
        ...prev,
        IsLoading: true,
        LoadingText:
          "The full name split is in progress; please wait a few minutes.",
      };
    });
    
    return await preflightService
      .preflightDataVerificationUpdate(
        preflightFileID,
        actionType
      )
      .then((res: any) => {
        message = res?.content?.Messages ? res?.content?.Messages[0] : "";
        if (res?.content?.Status === "Success") {
          setPageLoad((prev) => {
            return {
              ...prev,
              IsLoading: false,
            };
          });
          if (actionType === "FullName") {
            toast({
              title: "Success",
              description: "Full name has been successfully split and updated into separate fields.",
            });
            setDataVerificationOptions((prev) => {
              return {
                ...prev,
                IsFullNameValidated: true,
              };
            });
            var dataStatus = res.content.Data;
            if (dataStatus && dataStatus !== "") {
              dataStatus = JSON.parse(dataStatus);
              setPreflightFileInfo((prev) => {
                return {
                  ...prev,
                  Status: res?.content?.Status,
                  DataVerificationStatus: dataStatus?.DataVerification,
                };
              });
            }
          }
        } else if (res?.content?.Status === "Error") {
          isError = true;
        }
      })
      .catch((err) => {
        console.log(err);
        isError = true;
      })
      .finally(() => {
        setPageLoad((prev) => {
          return {
            ...prev,
            IsLoading: false,
          };
        });
        if (isError) {
          toast({
            title: "Error",
            description: message ? message : "Unable to complete the split action.",
            variant: "destructive"
          });
        }
      });
  };

  const splitAddressIntoSubFields = () => {
    if (!preflightFileID) {
      toast({
        title: "Error",
        description: "No preflight file ID available.",
        variant: "destructive"
      });
      return;
    }

    setPageLoad((prev) => {
      return {
        ...prev,
        IsLoading: true,
        LoadingText:
          "Address verification is in progress; please wait a few minutes.",
      };
    });
    preflightService
      .splitAddressIntoSubFields(preflightFileID)
      .then((res: any) => {
        setPageLoad((prev) => {
          return {
            ...prev,
            IsLoading: false,
          };
        });
        if (res?.content?.Status === "Success") {
          toast({
            title: "Success",
            description: "Full Address has been successfully split and updated into separate fields.",
          });
          setDataVerificationOptions((prev) => {
            return {
              ...prev,
              IsAddressValidated: true,
            };
          });
          var dataStatus = res?.content?.Data;
          if (dataStatus && dataStatus !== "") {
            dataStatus = JSON.parse(dataStatus);
            setPreflightFileInfo((prev) => {
              return {
                ...prev,
                Status: res?.content?.Status,
                DataVerificationStatus: dataStatus?.DataVerification,
              };
            });
          }
        } else {
          toast({
            title: "Warning",
            description: res?.content?.ErrorMessage || "Address split failed",
            variant: "warning"
          });
        }
      })
      .catch((ex) => {
        setPageLoad((prev) => {
          return {
            ...prev,
            IsLoading: false,
          };
        });
        toast({
          title: "Error",
          description: "Failed to split the full address.",
          variant: "destructive"
        });
      });
  };

  const EmailIDVerificationSiteSettingsSave = async () => {
    if (!preflightFileID) {
      toast({
        title: "Error",
        description: "No preflight file ID available.",
        variant: "destructive"
      });
      return;
    }

    let isError = false;
    setPageLoad((prev) => {
      return {
        ...prev,
        IsLoading: true,
        LoadingText: "Email enabling is in progress; please wait a few minutes.",
      };
    });
    if (!dataVerificationOptions?.IsEmailValidated) {
      const isOk = window.confirm(
        "Are you sure do you want to enable email verification status for this site?"
      );

      if (isOk) {
        try {
          const res: any = await preflightService.InitiateEmailVerification(
            false,
            true,
            false
          );
          if (res?.content?.Status === "Success") {
            setPageLoad((prev) => {
              return {
                ...prev,
                IsLoading: false,
              };
            });
            toast({
              title: "Success",
              description: "Email Verification has been successfully enabled for this site.",
            });
            setDataVerificationOptions((prev) => ({
              ...prev,
              IsEmailValidated: true,
            }));
            var dataStatus = res?.content?.Data;
            if (dataStatus && dataStatus !== "") {
              dataStatus = JSON.parse(dataStatus);
              setPreflightFileInfo((prev) => {
                return {
                  ...prev,
                  Status: res?.content?.Status,
                  DataVerificationStatus: dataStatus?.DataVerification,
                };
              });
            }
            //to update the main and section status
            preflightDataVerificationUpdate("EmailID");
          } else if (res?.content?.Status === "Error") {
            isError = true;
          }
        } catch (err) {
          console.log(err);
          isError = true;
        } finally {
          setPageLoad((prev) => {
            return {
              ...prev,
              IsLoading: false,
            };
          });
          if (isError) {
            toast({
              title: "Error",
              description: "Unable to enable Email verification option for this site.",
              variant: "destructive"
            });
          }
        }
      }
    } else {
      setPageLoad((prev) => {
        return {
          ...prev,
          IsLoading: false,
        };
      });
      toast({
        title: "Warning",
        description: "You cannot disable the email verification option once it is enabled.",
        variant: "warning"
      });
    }
  };

  // Render Data Verification Section
  const renderDataVerificationSection = () => {
    if (isInitialLoading) {
      return <Loading message="Please wait... while we fetch data verification details." />;
    }

    if (!dataVerificationOptions.IsFullAddressExists &&
        !dataVerificationOptions.IsFullNameExists &&
        !dataVerificationOptions.IsEmailExists) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Info className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-gray-700">
                  Data verification is not required for the imported file because there are no fields related to{" "}
                  <strong>Contact Name, Address, or Email ID.</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {dataVerificationOptions?.IsFullNameExists && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle>Split Full Name</CardTitle>
                </div>
                <Button
                  onClick={() => {
                    preflightDataVerificationUpdate("FullName");
                  }}
                  disabled={dataVerificationOptions.IsFullNameValidated}
                  className="w-40"
                >
                  {dataVerificationOptions.IsFullNameValidated ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    "Split Full Name"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Note: Use this option to split the full name into first and last names.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Case 1: If the full name is given as "John Doe", it will be split into:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>First Name:</strong> John</li>
                    <li><strong>Last Name:</strong> Doe</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Case 2: If the full name is given as "John Doe Smith", it will be split into:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>First Name:</strong> John Doe</li>
                    <li><strong>Last Name:</strong> Smith</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Case 3: If the full name is given as "John Doe Smith Alex", it will be split into:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>First Name:</strong> John Doe Smith</li>
                    <li><strong>Last Name:</strong> Alex</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {dataVerificationOptions?.IsFullAddressExists && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <CardTitle>Address Verification</CardTitle>
                </div>
                <Button
                  onClick={() => splitAddressIntoSubFields()}
                  disabled={dataVerificationOptions.IsAddressValidated}
                  className="w-40"
                >
                  {dataVerificationOptions.IsAddressValidated ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    "Split Full Address"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Note: Use the address verification tool to verify and standardize the address fields through Smarty API.
                  We are looking up values in the files and update into new fields.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">
                  If a full address (e.g., "1234 Elm St Springfield IL 62704") is provided and is valid, it will be split into the following fields:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Address Line 1:</strong> 1234 Elm St</li>
                  <li><strong>Address Line 2:</strong> (if applicable)</li>
                  <li><strong>City:</strong> Springfield</li>
                  <li><strong>State:</strong> IL</li>
                  <li><strong>ZIP Code:</strong> 62704</li>
                </ul>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  To validate and split the full address into individual components, please click the button split full address.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-purple-600" />
                <CardTitle>Email Verification</CardTitle>
              </div>
              <div className="flex">
                <div className="flex border rounded-md overflow-hidden">
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      !dataVerificationOptions.IsEmailValidated
                        ? "bg-blue-600 text-white"
                        : "bg-white text-blue-600 opacity-50"
                    }`}
                    onClick={() => {
                      if (dataVerificationOptions.IsEmailValidated) {
                        EmailIDVerificationSiteSettingsSave();
                      }
                    }}
                  >
                    Disable
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      dataVerificationOptions.IsEmailValidated
                        ? "bg-blue-600 text-white"
                        : "bg-white text-blue-600"
                    }`}
                    onClick={() => {
                      if (!dataVerificationOptions.IsEmailValidated) {
                        EmailIDVerificationSiteSettingsSave();
                      }
                    }}
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Our Email Verification System is an addon that verifies all of the emails in your database and identifies which emails are good or bad. 
                Correct email addresses are the foundation of communication with clients and we estimate that having the correct emails saves publisher 
                between $30,000 to $50,000 per year through increased sales, and production and email notices only being sent to people who are still at a company.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Email Verification Toggle:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    If email verification is already enabled in the site-wide defaults, this option cannot be disabled here.
                  </li>
                  <li>
                    This toggle is only available when email verification is disabled in the site settings, allowing you to enable the option from this page.
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Verification Process:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Enabling this option will start a background process to verify customer emails.
                  </li>
                  <li>
                    This process may take time depending on the total number of emails to be verified.
                  </li>
                </ul>
              </div>
            </div>

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                To proceed with enabling email verification, please use the toggle button.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="import-wizard" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/import-wizard/data-quality">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold">Data Normalization</h2>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-12">
            <ProgressStep 
              icon={<FileBox />}
              label="File Upload"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<MapColumns />}
              label="Column Mapping"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<FileCheck />}
              label="File Preflighting"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<DataQuality />}
              label="Data Quality"
              isComplete={true}
            />
            <StepConnector isCompleted={true} />
            <ProgressStep 
              icon={<TransformData />}
              label="Data Normalization"
              isActive={true}
            />
            <StepConnector />
            {/* <ProgressStep 
              icon={<FileBox />}
              label="Deduplication"
            />
            <StepConnector /> */}
            <ProgressStep 
              icon={<ClipboardCheck />}
              label="Final Review & Approval"
            />
            <StepConnector />
            <ProgressStep 
              icon={<ArrowUpCircle />}
              label="Import / Push"
            />
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Data Normalization</h3>
            {/* Data Verification Section */}
            {renderDataVerificationSection()}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/import-wizard/data-quality">
                <Button variant="outline">
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <Link to="/import-wizard/review">
              <Button 
                className="bg-[rgb(59,130,246)] hover:bg-[rgb(37,99,235)]"
              >
                Continue to Final Review
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
