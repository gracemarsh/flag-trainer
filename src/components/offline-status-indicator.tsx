"use client";

import { useState, useEffect } from "react";
import { useOfflineStatus } from "@/lib/spaced-repetition/hooks";
import {
  enableOfflineMode,
  disableOfflineMode,
  OfflineStatus,
  subscribeToOfflineStatus,
  initializeOfflineSupport,
} from "@/lib/spaced-repetition/offline";
import { forceSynchronization } from "@/lib/spaced-repetition/sync";

// This component can be used in the layout or navbar to provide offline status indication
export default function OfflineStatusIndicator() {
  // Get the current offline status
  const {
    isOnline,
    isInOfflineMode,
    offlineModeExpiry,
    isOfflineModeExpired,
    syncPending,
  } = useOfflineStatus();

  // Local state for interactions
  const [isWorking, setIsWorking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Format expiry time
  const formatExpiryTime = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  // Convert milliseconds to days
  const getDaysUntilExpiry = (timestamp: number | null) => {
    if (!timestamp) return 0;
    const now = Date.now();
    const diff = timestamp - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  // Handle enabling offline mode
  const handleEnableOfflineMode = async () => {
    setIsWorking(true);
    try {
      // Default duration is 7 days
      enableOfflineMode();
    } finally {
      setIsWorking(false);
    }
  };

  // Handle disabling offline mode
  const handleDisableOfflineMode = async () => {
    setIsWorking(true);
    try {
      disableOfflineMode();

      // Force sync if we're online
      if (isOnline && syncPending) {
        await forceSynchronization();
      }
    } finally {
      setIsWorking(false);
    }
  };

  // Sync now button handler
  const handleSyncNow = async () => {
    setIsWorking(true);
    try {
      await forceSynchronization();
    } finally {
      setIsWorking(false);
    }
  };

  // Determine the status text and color
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        text: "Offline",
        color: "text-red-500",
        bgColor: "bg-red-100",
        icon: "🔴",
      };
    }

    if (isInOfflineMode) {
      if (isOfflineModeExpired) {
        return {
          text: "Offline Mode (Expired)",
          color: "text-orange-500",
          bgColor: "bg-orange-100",
          icon: "🟠",
        };
      }

      return {
        text: "Offline Mode",
        color: "text-amber-500",
        bgColor: "bg-amber-100",
        icon: "🟡",
      };
    }

    return {
      text: "Online",
      color: "text-green-500",
      bgColor: "bg-green-100",
      icon: "🟢",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`rounded-lg p-2 ${statusInfo.bgColor} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{statusInfo.icon}</span>
          <span className={`font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 text-sm">
          {isInOfflineMode && (
            <div className="mb-2">
              <p className="text-gray-600">
                Offline mode {isOfflineModeExpired ? "expired" : "expires"}:{" "}
                {formatExpiryTime(offlineModeExpiry)}
              </p>
              {!isOfflineModeExpired && offlineModeExpiry && (
                <p className="text-gray-600">
                  Days remaining: {getDaysUntilExpiry(offlineModeExpiry)}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {isOnline && !isInOfflineMode && (
              <button
                onClick={handleEnableOfflineMode}
                disabled={isWorking}
                className="px-3 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
              >
                {isWorking ? "Working..." : "Enable Offline Mode"}
              </button>
            )}

            {isInOfflineMode && (
              <button
                onClick={handleDisableOfflineMode}
                disabled={isWorking}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isWorking ? "Working..." : "Disable Offline Mode"}
              </button>
            )}

            {isOnline && syncPending && (
              <button
                onClick={handleSyncNow}
                disabled={isWorking}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isWorking ? "Syncing..." : "Sync Now"}
              </button>
            )}
          </div>

          {syncPending && (
            <p className="mt-2 text-blue-500">
              {syncPending
                ? "Changes pending synchronization"
                : "All changes synchronized"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Custom hook for monitoring network status
// This is just a placeholder - the actual implementation is in the hooks.ts file
function useOfflineStatus(): OfflineStatus {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isInOfflineMode: false,
    offlineModeExpiry: null,
    isOfflineModeExpired: false,
    syncPending: false,
  });

  useEffect(() => {
    // This is a simplified version - the actual implementation is in the hooks.ts file
    // Initialize
    initializeOfflineSupport();

    // Subscribe to changes
    const unsubscribe = subscribeToOfflineStatus(setStatus);

    // Clean up on unmount
    return unsubscribe;
  }, []);

  return status;
}
