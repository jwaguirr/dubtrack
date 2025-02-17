"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, signOut } from "next-auth/react";
import { QRResponse } from "~/types/qr-type";
import DonutChart from "./dash-components/location-donut";
import { useRouter } from "next/navigation";

// HeroUI components
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Card,
  CardBody,
} from "@heroui/react";

// Icons
import {
  IconHome,
  IconLayoutDashboard,
  IconPlus,
  IconTrash,
  IconLink,
  IconCheck,
  IconQrcode,
} from "@tabler/icons-react";

// Custom components
import { FloatingDock } from "~/components/ui/floating-dock";
import { Carousel } from "~/components/ui/carousel";
import { loadingSlideData } from "~/lib/const";
import ScanTrendsChart from "./dash-components/line-chart";

// Just a placeholder if you don’t have the real chart ready.
function LineChartPlaceholder() {
  return (
    <div className="w-full h-60 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg">
      Line Chart Placeholder
    </div>
  );
}

const dummyOSBreakdown = [
  { os: "iOS", percentage: 45 },
  { os: "Windows", percentage: 25 },
  { os: "Android", percentage: 15 },
  { os: "MacOS", percentage: 10 },
  { os: "Linux", percentage: 5 },
];

export const links = [
  {
    title: "Home",
    icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/dashboard",
  },
  {
    title: "Analytics",
    icon: <IconLayoutDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/qr-analytics",
  },
];

// Types
type CreateQRInput = {
  url: string;
};

type DeleteQRInput = {
  qr_uid: string;
};

type slidesType = {
  title: string;
  button: string;
  src: string;
};

function Dashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/auth/sign-in"); // Redirect to sign-in if no session
      } else {
        setIsAuthenticated(true); // Mark as authenticated
      }
    };

    void checkSession();
  }, [router]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [customURL, setCustomURL] = useState("");
  const [slideData, setSlideData] = useState(loadingSlideData);
  const [currentStep, setCurrentStep] = useState(0);




  // --- API Calls ---
  const createQR = async (my_url: CreateQRInput) => {
    const session = await getSession();
    if (!session) throw new Error("No active session");

    const returned = await fetch(`/api/qr/create-qr`, {
      method: "POST",
      body: JSON.stringify({ url: my_url.url }),
    });
    if (!returned.ok) {
      throw new Error(`HTTP error! status: ${returned.status}`);
    }
    return await returned.json();
  };

  const deleteQR = async (qr_uid: DeleteQRInput) => {
    const session = await getSession();
    if (!session) throw new Error("No active session");

    const returned = await fetch(`/api/qr/remove-qr`, {
      method: "POST",
      body: JSON.stringify({ qr_uid: qr_uid.qr_uid }),
    });
    if (!returned.ok) {
      throw new Error(`HTTP error! status: ${returned.status}`);
    }
    return await returned.json();
  };

  const fetchQR = async () => {
    const response = await fetch(`/api/qr/pull-qr`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();
  };

  const { data: qrs } = useQuery<QRResponse, Error>(
    ["fetch-qrs"], 
    fetchQR,
    {
      enabled: isAuthenticated === true, 
    }
  );
  
  const fetchTotalAndUniqueScans = async () => {
    const response = await fetch(`/api/qr/qr-stats/total_qr`, {
      method: "GET",
    });
    return await response.json();
  };

  // Query: total & unique scans
  const { data: total_and_unique_scans } = useQuery<
    { total_scans: number; total_unique_scans: number },
    Error
  >({
    queryKey: ["fetch-total-and-unique-scans"],
    queryFn: fetchTotalAndUniqueScans,
  });

  // Process QR data -> for carousel or placeholders
  useEffect(() => {
    if (qrs && qrs.qrCodes.length > 0) {
      const newLinks: slidesType[] = qrs.qrCodes.map((elem) => ({
        title: elem.embedded_link,
        button: "View Analytics",
        src: elem.filepath,
      }));
      setSlideData(newLinks);
    } else {
      setSlideData([
        {
          title: "No active QRs!",
          button: "Make one",
          src: "/placeholder-qr.png",
        },
      ]);
    }
  }, [qrs]);

  // --- Mutations ---
  const createNewQrMutation = useMutation({
    mutationFn: (input: CreateQRInput) => createQR(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["fetch-qrs"] });
      setCustomURL("");
      setCurrentStep(2);
    },
  });

  const deleteQRMutation = useMutation({
    mutationFn: (input: DeleteQRInput) => deleteQR(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["fetch-qrs"] });
    },
  });

  const handleCreateQR = () => {
    createNewQrMutation.mutate({ url: customURL });
  };

  const totalQR = qrs?.qrCodes?.length ?? 0;

  const fetchAnalytics = async () => {
    const response = await fetch(`/api/qr/qr-stats/analytics`, {
      method: "GET",
    });
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    return await response.json();
  };

  const { data: rawAnalytics } = useQuery<{ osBreakdown: any[]; topCities: any[] }, Error>({
    queryKey: ["fetch-analytics"],
    queryFn: fetchAnalytics,
    select: (data) => ({
      osBreakdown: data.osBreakdown.map((entry) => ({
        os: entry.os ?? "Unknown",
        percentage: parseFloat(entry.percentage),
      })),
      topCities: data.topCities,
    }),
  });

  const fetchScanTrends = async () => {
    const response = await fetch(`/api/qr/qr-stats/scans-over-time`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    return await response.json();
  };

  const { data: scanTrends } = useQuery<
    { scanTrends: { scan_date: string; total_scans: number }[] },
    Error
  >({
    queryKey: ["fetch-scan-trends"],
    queryFn: fetchScanTrends,
  });

  // Redirect to the details page for a specific QR
  const handleViewAnalytics = (qr_uid: string) => {
    router.push(`/qr-analytics/${qr_uid}`);
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-300">Checking authentication...</p>
      </div>
    );
  }

  // -------------- Layout & UI --------------
  return (
    <div className="min-h-screen pb-12 flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {/* Top Bar / Header */}
      <div className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
          <div className="flex">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">dubtrack</h1>
          </div>
          <h1 className='absolute left-1/2 -translate-x-1/2 text-3xl'>Dashboard</h1>
          {/* Create QR Button */}
          <div className="flex justify-end">
            <Button onClick={onOpen} color="primary" className="flex items-center gap-2">
              <IconPlus size={20} />
              Create QR
            </Button>
          </div>
        </div>
        {/* <button onClick={() => signOut()}> 
          Sign on
        </button> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800 shadow-md">
          <CardBody>
            <div className="text-2xl dark:text-white font-bold">
              {total_and_unique_scans?.total_scans ?? 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
          </CardBody>
        </Card>

        <Card className="dark:bg-gray-800 shadow-md">
          <CardBody>
            <div className="text-2xl font-bold dark:text-white">
              {total_and_unique_scans?.total_unique_scans ?? 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Unique</div>
          </CardBody>
        </Card>

          <Card className="dark:bg-gray-800 shadow-md">
            <CardBody>
              <div className="text-2xl font-bold dark:text-white">{totalQR}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Codes</div>
            </CardBody>
          </Card>

          <Card className="dark:bg-gray-800 shadow-md">
            <CardBody>
              <div className="text-2xl font-bold dark:text-white">
                {total_and_unique_scans && totalQR > 0
                  ? Math.round((total_and_unique_scans?.stats.total_scans / totalQR) * 100) / 100
                  : 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg / Code</div>
            </CardBody>
          </Card>
        </div>

        {/* Charts & Top QR Codes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Scans Over Time (Line Chart) */}
          <div className="md:col-span-8">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-center">Scans Over Time</h3>
              {scanTrends?.scanTrends ? (
                <ScanTrendsChart data={scanTrends.scanTrends} />
              ) : (
                <div className="flex items-center justify-center h-60 text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              )}
            </div>
          </div>

          {/* Right: Top Total (List of QRs) */}
          <div className="md:col-span-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Top Total</h3>
            </div>
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
              {(qrs?.qrCodes || []).map((qr) => (
                <div
                  key={qr.qr_uid}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-md p-2"
                >
                  <div className="flex items-center space-x-2">
                    {/* Use next/image if you prefer */}
                    <img
                      src={`/api/protected-qrcode/${qr.qr_uid}`}
                      alt="QR Code"
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[140px] sm:max-w-[220px]">
                      {qr.embedded_link}
                    </span>
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => handleViewAnalytics(qr.qr_uid)}
                    className="text-xs px-2 py-1"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Top Locations & OS Donut */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Locations */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
            <div className="space-y-2">
              {rawAnalytics?.topCities ? (
                rawAnalytics.topCities.length > 0 ? (
                  rawAnalytics.topCities.map((city, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{city.city ?? "Unknown"}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {Math.round(city.percentage * 100) / 100}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No scan data yet!</p>
                )
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              )}
            </div>
          </div>

          {/* OS Breakdown */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Operating System</h3>
            {rawAnalytics?.osBreakdown && rawAnalytics.osBreakdown.length > 0 ? (
              <DonutChart data={rawAnalytics.osBreakdown} />
            ) : (
              <div className="flex items-center justify-center h-60 text-gray-500 dark:text-gray-400">
                {rawAnalytics?.osBreakdown ? "No scan data yet!" : "Loading..."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create QR Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setCurrentStep(0);
          setCustomURL("");
        }}
      >
        <ModalContent className="max-w-md dark:bg-gray-800">
          <ModalHeader className='dark:text-white'>Create New QR Code</ModalHeader>
          <ModalBody>
            {/* Stepper */}
            <div className="relative mb-6">
              <div className="flex justify-between">
                {/* Step 1 */}
                <div
                  className={`flex flex-col items-center ${
                    currentStep >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center">
                    <IconLink className="w-5 h-5" />
                  </div>
                  <p className="text-sm mt-1">Enter URL</p>
                </div>
                {/* Step 2 */}
                <div
                  className={`flex flex-col items-center ${
                    currentStep >= 1
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center">
                    <IconQrcode className="w-5 h-5" />
                  </div>
                  <p className="text-sm mt-1">Generate</p>
                </div>
                {/* Step 3 */}
                <div
                  className={`flex flex-col items-center ${
                    currentStep >= 2
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center">
                    <IconCheck className="w-5 h-5" />
                  </div>
                  <p className="text-sm mt-1">Complete</p>
                </div>
              </div>
              {/* Stepper line */}
              <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200 dark:bg-gray-700 -z-10">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                />
              </div>
            </div>

            {/* Modal Body Content */}
            {currentStep === 0 && (
              <Input
                label="Destination URL"
                placeholder="https://example.com"
                value={customURL}
                onChange={(e) => setCustomURL(e.target.value)}
                className="w-full"
              />
            )}
            {currentStep === 1 && (
              <div className="text-center">
                <IconQrcode
                  size={64}
                  className="mx-auto mb-4 text-blue-600 dark:text-blue-400 animate-pulse"
                />
                <p>Generating your QR code...</p>
              </div>
            )}
            {currentStep === 2 && (
              <div className="text-center text-green-600 dark:text-green-400">
                <IconCheck size={64} className="mx-auto mb-4" />
                <p>QR code created successfully!</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onClick={() => {
                onClose();
                setCurrentStep(0);
                setCustomURL("");
              }}
            >
              Cancel
            </Button>
            {currentStep === 0 && (
              <Button
                color="primary"
                onClick={() => {
                  setCurrentStep(1);
                  handleCreateQR();
                }}
                disabled={!customURL}
              >
                Generate QR
              </Button>
            )}
            {currentStep === 2 && (
              <Button color="primary" onClick={onClose}>
                Done
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Floating Dock (Footer Nav) */}
      <div className="relative">
        <FloatingDock
          desktopClassName="fixed bottom-2 w-1/5 left-0 right-0 bg-transparent shadow-t flex justify-center"
          mobileClassName="fixed bottom-0 left-0 right-0 bg-transparent shadow-t flex justify-center"
          items={links}
        />
      </div>
    </div>
  );
}

export default Dashboard;
