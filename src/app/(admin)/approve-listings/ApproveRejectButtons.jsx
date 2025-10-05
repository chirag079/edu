"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";

/**
 * ApproveRejectButtons component for admin approval interface
 *
 * @param {Object} props - Component props
 * @param {string} props.id - The ID of the item being approved/rejected
 * @param {boolean} props.isProcessing - Whether an action is currently being processed
 * @param {Function} props.onApprove - Function to call when approving
 * @param {Function} props.onReject - Function to call when rejecting
 * @returns {JSX.Element} The rendered component
 */
export default function ApproveRejectButtons({
  id,
  isProcessing = false,
  onApprove,
  onReject,
}) {
  return (
    <div className="flex gap-3">
      <Button
        variant="default"
        className="flex-1 bg-green-600 hover:bg-green-700"
        onClick={onApprove}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Check className="h-4 w-4 mr-1" />
        )}
        Approve
      </Button>

      <Button
        variant="destructive"
        className="flex-1"
        onClick={onReject}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <X className="h-4 w-4 mr-1" />
        )}
        Reject
      </Button>
    </div>
  );
}
