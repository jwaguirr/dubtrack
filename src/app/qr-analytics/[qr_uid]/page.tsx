"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  IconHome,
  IconUser,
  IconLayoutDashboard,
  IconQrcode,
  IconLink,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FloatingDock } from "~/components/ui/floating-dock";

type CreationData = {
    qrDetails : {
        created_at: string,
        embedded_link: string,
        short_url: string,
        short_code: string,
        filepath: string
    }
}

type QRAnalytics = {
  analytics: {
    total_scans: string;  // Changed from number to string to match API response
    unique_scans: string;
    active_since: string;
    created_at: string;
  };
  qr_uid: string;
}

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
  ]


  type DeleteQRInput = {
    qr_uid: string
  }

const COLORS = ["#007bff", "#6c757d", "#28a745", "#ffc107", "#dc3545", "#17a2b8", "#6610f2"];

const Map = dynamic(() => import("~/app/qr-analytics/components/map"), { ssr: false });


// Fetch the most recent QR code if no qr_uid is provided
const fetchLatestQr = async (): Promise<{ qr_uid: string }> => {
  const response = await fetch("/api/qr/qr-stats/specific-qr/analytics");
  if (!response.ok) throw new Error("Failed to fetch latest QR code");
  return await response.json();
};

// Fetch analytics for a specific QR code
const fetchQrAnalytics = async (qr_uid: string) => {
  const response = await fetch(`/api/qr/qr-stats/specific-qr/analytics?qr_uid=${qr_uid}`);
  if (!response.ok) throw new Error("Failed to fetch QR analytics");
  return await response.json();
};

// Fetch scan trends for a specific QR code
const fetchScanTrends = async (qr_uid: string) => {
  const response = await fetch(`/api/qr/qr-stats/specific-qr/scans-over-time?qr_uid=${qr_uid}`);
  if (!response.ok) throw new Error("Failed to fetch scan trends");
  return await response.json();
};

// Fetch OS breakdown for a specific QR code
const fetchOsBreakdown = async (qr_uid: string) => {
  const response = await fetch(`/api/qr/qr-stats/specific-qr/os-breakdown?qr_uid=${qr_uid}`);
  if (!response.ok) throw new Error("Failed to fetch OS breakdown");
  return await response.json();
};

// Fetch top locations for a specific QR code
const fetchTopLocations = async (qr_uid: string) => {
  const response = await fetch(`/api/qr/qr-stats/specific-qr/top-locations?qr_uid=${qr_uid}`);
  if (!response.ok) throw new Error("Failed to fetch top locations");
  return await response.json();
};



export default function SingleQrAnalytics() {
    const params = useParams();
    const passedQrUid = params.qr_uid as string;
    const qr_uid = passedQrUid;
    const router = useRouter()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [customURL, setCustomURL] = useState("")
    const [currentStep, setCurrentStep] = useState(0)
    const [deleteText, setDeleteText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false)
    const queryClient = useQueryClient()

    if (qr_uid === "-1") {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex items-center justify-center">
          <h1 className="text-2xl font-bold">No QR Codes Created</h1>
        </div>
      );
    }

    const deleteQR = async (qr_uid: DeleteQRInput) => {
        const returned = await fetch(`/api/qr/remove-qr`, {
        method: "POST",
        body: JSON.stringify({ qr_uid: qr_uid.qr_uid })
        })
        if (!returned.ok) {
        throw new Error(`HTTP error! status: ${returned.status}`)
        }
        return await returned.json()
    }

    const deleteQRMutation = useMutation({
        mutationFn: (input: DeleteQRInput) => deleteQR(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["fetch-qrs"] })
        }
    })

    const handleDelete = () => {
      if (deleteText === 'I wish to delete') {
        deleteQRMutation.mutate({qr_uid: qr_uid})
        router.push('/dashboard')
      }
    };
    
    const fetchQrDetails = async (qr_uid: string) => {
        const response = await fetch("/api/qr/qr-stats/specific-qr/fetch-creation-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_uid }),
        });
        
        if (!response.ok) throw new Error("Failed to fetch QR details");
        
        return await response.json();
    };

    const { data: creation_data, isLoading, error } = useQuery<CreationData>({
        queryKey: ["qr-details", qr_uid],
        queryFn: () => fetchQrDetails(qr_uid),
        enabled: !!qr_uid,
    });
  // Fetch analytics data for the QR code
  const { data: qrAnalytics, isLoading: isAnalyticsLoading } = useQuery<QRAnalytics>({
    queryKey: ["qr-analytics", qr_uid],
    queryFn: () => fetchQrAnalytics(qr_uid!),
    enabled: !!qr_uid,
  });

  // Fetch scan trends
  const { data: scanTrends, isLoading: isScanTrendsLoading } = useQuery({
    queryKey: ["scan-trends", qr_uid],
    queryFn: () => fetchScanTrends(qr_uid!),
    enabled: !!qr_uid,
  });

  // Fetch OS breakdown
  const { data: osBreakdown, isLoading: isOsBreakdownLoading } = useQuery({
    queryKey: ["os-breakdown", qr_uid],
    queryFn: () => fetchOsBreakdown(qr_uid!),
    enabled: !!qr_uid,
    select: (data) => ({
        osBreakdown: data.osBreakdown.map(entry => ({
            os: entry.os,
            percentage: parseFloat(entry.percentage),
        }))
        }),
    });


  const { data: topLocations, isLoading: isTopLocationsLoading } = useQuery({
    queryKey: ["top-locations", qr_uid],
    queryFn: () => fetchTopLocations(qr_uid!),
    enabled: !!qr_uid,
    select: (data) => ({
        topLocations: Array.isArray(data?.topCities)
            ? data.topCities
                .filter(loc => loc.city && loc.lat && loc.lon)
                .map(loc => ({
                    ...loc,
                    lat: parseFloat(loc.lat),
                    lon: parseFloat(loc.lon),
                    percentage: parseFloat(loc.percentage),
                }))
            : []
    }),
});
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {/* Modal */}
        <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose()
          setCurrentStep(0)
          setCustomURL("")
        }}
      >
        <ModalContent className="max-w-md dark:bg-gray-800">
          <ModalHeader className="dark:text-white">Create New QR Code</ModalHeader>
          <ModalBody>
          <div>
                {creation_data && ( 
                    <div>
                        <h2 className="dark:text-white">QR Code Details</h2>
                        <p className="dark:text-white"><strong>Created At:</strong> {new Date(creation_data?.qrDetails.created_at).toLocaleString()}</p>
                        <p className="dark:text-white"><strong>Embedded Link:</strong> {creation_data.qrDetails.embedded_link}</p>
                        <p className="dark:text-white"><strong>Short URL:</strong> {creation_data.qrDetails.short_url}</p>
                        <p className="dark:text-white"><strong>Short Code:</strong> {creation_data.qrDetails.short_code}</p>
                    </div>
                )
            }
        </div>
            {isDeleting && (
                <div className="space-y-2">
                    <h1 className="text-center text-lg font-semibold">
                    Please type `I wish to delete`
                    </h1>
                    <Input
                    placeholder="I wish to delete"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    />
            </div>
            )}
          </ModalBody>
          <ModalFooter>

                {isDeleting ? (
                    <Button
                    color="danger"
                    onClick={handleDelete}
                    disabled={deleteText !== 'I wish to delete'}
                            >
                        Are you sure?
                    </Button>
                ) : 
                (<Button
                    color="danger"
                    onClick={() => setIsDeleting(true)}
                    >
                Delete
              </Button>
              )}

              <Button
                color="primary"
                onClick={onClose}
              >
                Close
              </Button> 
          </ModalFooter>
        
        </ModalContent>
      </Modal>

      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">dubtrack</h1>
          </div>
          {/* <Button onPress={() => router.back()} color="default" variant="bordered" className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400" href="/dashboard">
            Go Back
          </Button> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Stats */}
        <div className="flex justify-between gap-4 flex-wrap">
          <Card className="shadow-md w-full px-6 sm:w-auto dark:bg-gray-800">
            <CardBody>
            <div className="text-2xl font-bold dark:text-white">
                {isAnalyticsLoading 
                  ? "Loading..." 
                  : qrAnalytics?.analytics?.total_scans ?? "No data"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Scans</div>
            </CardBody>
          </Card>

          <Card className="shadow-md w-full px-6 sm:w-auto dark:bg-gray-800">
            <CardBody className="cursor-pointer hover:scale-105 duration-500" onClick={onOpen}>
              <div className="text-2xl font-bold dark:text-white">Currently Viewing</div>
              <div className="text-sm text-center text-gray-500 dark:text-gray-400">{creation_data?.qrDetails?.embedded_link ?? "---"}</div>
            </CardBody>
          </Card>

          <Card className="shadow-md w-full px-6 sm:w-auto dark:bg-gray-800">
            <CardBody>
              <div className="text-2xl font-bold dark:text-white">{qrAnalytics?.analytics?.unique_scans ?? "Loading..."}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Unique Scans</div>
            </CardBody>
          </Card>
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Line Chart for Scan Trends */}
          <div className="md:col-span-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Scans Over Time</h3>
            {scanTrends && (scanTrends?.scanTrends.length <= 0 && "You have no scans!")}
            {isScanTrendsLoading ? (
              <p>Loading...</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scanTrends?.scanTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="scan_date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Line type="monotone" dataKey="total_scans" stroke="#60A5FA" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Right: Top Locations */}
          <div className="md:col-span-4 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
            {topLocations?.topLocations && (topLocations?.topLocations <= 0 && "You have no scans!")}
            {isTopLocationsLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="h-[200px] overflow-y-auto">
                {topLocations?.topLocations?.map((loc) => (
                  <div key={loc.city} className="flex items-center justify-between py-1">
                    <span>{loc.city}</span>
                    <span className="text-gray-500 dark:text-gray-400">{Math.round(loc.percentage * 100) / 100}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QR Code and Operating System */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: QR Code */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Your QR Code</h3>
            <div className="flex justify-center">
            {qr_uid ? (
                <Image
                    src={`/api/protected-qrcode/${qr_uid}`}
                    alt="QR Code"
                    width={256}
                    height={256}
                    unoptimized={true}
                />
                ) : (
                <p className="text-gray-500 dark:text-gray-400">QR code not available</p>
                )}
                               
             </div>
          </div>

          {/* Right: Operating System */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Operating System</h3>
            {osBreakdown && (osBreakdown.osBreakdown.length <= 0 && "You have zero scans")}
            {isOsBreakdownLoading ? (
              <p>Loading...</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={osBreakdown?.osBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" dataKey="percentage" nameKey="os" >
                    {osBreakdown?.osBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend formatter={(value) => <span className="text-gray-800 dark:text-gray-200">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Your Clicks</h3>
            {isTopLocationsLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="mt-6 -z-20">
                        <Map locations={topLocations?.topLocations ?? []} />
                    </div>
                </>
            )}
        </div>
      </div>
        {/* Bottom Floating Dock or Footer */}
            <div className="relative pb-20 z-50">
              <FloatingDock
                desktopClassName="fixed bottom-2 w-1/5 left-0 right-0 bg-transparent shadow-t flex justify-center"
                mobileClassName="fixed bottom-0 left-0 right-0 bg-transparent shadow-t flex justify-center"
                items={links}
              />
            </div>
    </div>
  );
}
