"use client";
import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export default function LockButton({
  locked,
  onLock,
  onUnlock
}: {
  locked: boolean;
  onLock: () => Promise<void>;
  onUnlock: () => Promise<void>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLock = async () => {
    setIsLoading(true);
    try {
      await onLock();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockConfirm = async () => {
    setIsLoading(true);
    setShowConfirm(false);
    try {
      await onUnlock();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {locked ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-75"
        >
          {isLoading ? "Unlocking..." : "Unlock to Edit"}
        </button>
      ) : (
        <button
          onClick={handleLock}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition shadow-sm disabled:opacity-75"
        >
          {isLoading ? "Saving..." : "Save & Lock"}
        </button>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Unlock Entry?"
        message="Unlocking will let you edit a historical entry — are you sure?"
        confirmText="Unlock"
        onConfirm={handleUnlockConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
