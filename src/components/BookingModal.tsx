"use client";

import { useState, useEffect } from "react";
import { X, Clock, User, NotebookPen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { Booking } from "@/store/useBookingStore";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialId?: string;
  initialStart?: Date;
  initialEnd?: Date;
  initialPurpose?: string;
  initialPIC?: string;
  isEditMode?: boolean;
  data: any;
  fetchBookings: () => void;
  onSubmit?: (data: {
    purpose: string;
    startTime: Date;
    endTime: Date;
    pic: string;
  }) => void;
}

// Helper untuk konversi Date → input lokal
function toLocalInputValue(date?: Date) {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export const BookingModal = ({
  isOpen,
  onClose,
  initialId,
  initialStart,
  initialEnd,
  initialPurpose,
  initialPIC,
  isEditMode = false,
  onSubmit,
  data,
  fetchBookings,
}: BookingModalProps) => {
  const [purpose, setPurpose] = useState(initialPurpose || "");
  const [pic, setPic] = useState(initialPIC || "");
  const [startDate, setStartDate] = useState(toLocalInputValue(initialStart));
  const [endDate, setEndDate] = useState(toLocalInputValue(initialEnd));
  const [loading, setLoading] = useState(false);

  // 🔹 Error state untuk field start & end
  const [startError, setStartError] = useState("");
  const [endError, setEndError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPurpose(initialPurpose || "");
      setPic(initialPIC || "");
      setStartDate(toLocalInputValue(initialStart));
      setEndDate(toLocalInputValue(initialEnd));
      setStartError("");
      setEndError("");
    }
  }, [isOpen, initialPurpose, initialPIC, initialStart, initialEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error
    setStartError("");
    setEndError("");

    if (!purpose || !pic || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validasi end setelah start
    if (end <= start) {
      setStartError("Start time must be before end time");
      setEndError("End time must be after start time");
      return;
    }

    // Validasi bentrok dengan data lain
    const conflictBooking = data.find((booking: Booking) => {
      const existingStart = new Date(booking.start);
      const existingEnd = new Date(booking.end);

      // Abaikan booking yang sedang diedit
      if (isEditMode && booking.id === initialId) return false;

      return start < existingEnd && end > existingStart;
    });

    if (conflictBooking) {
      setStartError("Selected time conflicts with another booking");
      setEndError("Selected time conflicts with another booking");
      return;
    }

    // Submit
    const payload = { purpose, pic, startTime: start, endTime: end };
    onSubmit?.(payload);
  };

  const handleDelete = async () => {
    if (!initialId) return;
    if (!confirm("Are you sure you want to delete this booking?")) return;

    setLoading(true);
    try {
      await apiRequest(`/bookings/${initialId}`, "DELETE");
      fetchBookings?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to delete booking");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full border border-border">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {isEditMode ? "Edit Booking" : "Create New Booking"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEditMode
                    ? "Update your meeting details"
                    : "Schedule a new meeting"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose" className="flex items-center gap-2 text-sm font-medium">
                <NotebookPen className="h-4 w-4 text-primary" />
                Purpose
              </Label>
              <Input
                id="purpose"
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Enter meeting purpose"
                required
                className="h-11"
              />
            </div>

            {/* PIC */}
            <div className="space-y-2">
              <Label htmlFor="pic" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-primary" />
                Person in Charge (PIC)
              </Label>
              <Input
                id="pic"
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Enter responsible person"
                required
                className="h-11"
              />
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="start" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" />
                Start Time
              </Label>
              <Input
                id="start"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max="2030-12-31T23:59"
                required
                className={`h-11 ${startError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {startError && (
                <p className="text-destructive text-sm flex items-center gap-1.5">
                  <span className="text-xs">⚠️</span>
                  {startError}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="end" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" />
                End Time
              </Label>
              <Input
                id="end"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max="2030-12-31T23:59"
                required
                className={`h-11 ${endError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {endError && (
                <p className="text-destructive text-sm flex items-center gap-1.5">
                  <span className="text-xs">⚠️</span>
                  {endError}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              {isEditMode && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="outline"
                  className="flex-1 h-11 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 h-11 bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Booking"
                  : "Create Booking"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
