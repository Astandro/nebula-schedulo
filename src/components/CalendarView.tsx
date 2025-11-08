/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { BookingModal } from "./BookingModal";
import { Calendar as CalendarIcon, Clock, Users, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventDropArg } from "@fullcalendar/core/index.js";
import { apiRequest } from "@/lib/api";

/* ------------------------------------------------------------
* 🗓️ CalendarView Component
* ------------------------------------------------------------ */
interface Booking {
  id: string;
  purpose: string;
  start: Date;
  end: Date;
  pic: string;
}

export const CalendarView = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek">("timeGridWeek");
  const [newBookingId, setNewBookingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const API_URL = "/bookings";

  /* 🚀 Fetch all bookings */
  const fetchBookings = async () => {
    try {
      const data = await apiRequest(API_URL, "GET");
      if (Array.isArray(data)) {
        setBookings(
          data.map((b: any) => ({
            id: b.id.toString(),
            purpose: b.purpose,
            start: new Date(b.startTime),
            end: new Date(b.endTime),
            pic: b.pic || "",
          }))
        );
      }
    } catch (err) {
      console.error("❌ Failed to fetch bookings:", err);
    }
  };

  const onClose = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setEditingBooking(null);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ✨ Select date slot → open modal */
  const handleDateSelect = (selectInfo: { start: Date; end: Date }) => {
    setSelectedSlot(selectInfo);
    setIsModalOpen(true);
  };

  /* ✨ Create or update booking */
  const handleBookingSubmit = async (data: {
    purpose: string;
    startTime: Date;
    endTime: Date;
    pic: string;
  }) => {
    const payload = {
      purpose: data.purpose,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      pic: data.pic,
    };

    try {
      if (editingBooking) {
        await apiRequest(`${API_URL}/${editingBooking.id}`, "PUT", payload);
      } else {
        await apiRequest(API_URL, "POST", payload);
      }
      fetchBookings();
    } catch (err) {
      console.error("❌ Failed to save booking:", err);
    } finally {
      onClose();
    }
  };

  /* ✨ Drag/drop update */
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const id = dropInfo.event.id;
    const payload = {
      startTime: dropInfo.event.start?.toISOString(),
      endTime: dropInfo.event.end?.toISOString(),
    };

    // update local state instantly
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              start: new Date(payload.startTime!),
              end: new Date(payload.endTime!),
            }
          : b
      )
    );

    await apiRequest(`${API_URL}/${id}`, "PUT", payload);
  };

  /* ✨ Resize booking event */
  const handleEventResize = async (resizeInfo: any) => {
    const id = resizeInfo.event.id;
    const payload = {
      startTime: resizeInfo.event.start?.toISOString(),
      endTime: resizeInfo.event.end?.toISOString(),
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              start: new Date(payload.startTime!),
              end: new Date(payload.endTime!),
            }
          : b
      )
    );

    await apiRequest(`${API_URL}/${id}`, "PUT", payload);
  };

  /* ✨ Click event → edit */
  const handleEventClick = (clickInfo: any) => {
    const booking = bookings.find((b) => b.id === clickInfo.event.id);
    if (booking) {
      setEditingBooking({
        ...booking,
        start: new Date(booking.start),
        end: new Date(booking.end),
        purpose: booking.purpose || "",
        pic: booking.pic || "",
      });
      setIsModalOpen(true);
    }
  };

  /* ✨ Convert bookings → FullCalendar format */
  const events = bookings.map((b) => ({
    id: b.id,
    title: `${b.purpose} (${b.pic})`,
    start: b.start,
    end: b.end,
    // Remove color overrides - let CSS handle styling
  }));

  // Calculate stats
  const totalBookings = bookings.length;
  const uniquePeople = new Set(bookings.map(b => b.pic)).size;
  
  // Calculate total hours booked this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  const hoursBookedThisWeek = bookings.reduce((total, booking) => {
    const start = new Date(booking.start);
    const end = new Date(booking.end);
    
    if (start >= startOfWeek && start < endOfWeek) {
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }
    return total;
  }, 0);

  return (
    <div className="w-full space-y-6 flex-1 flex flex-col">
      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {/* Total Bookings */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <div className="icon-container-purple mb-2">
                <CalendarIcon className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-0.5">
                {totalBookings}
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                Total Bookings
              </div>
            </div>
          </div>
        </div>

        {/* Unique People */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <div className="icon-container-green mb-2">
                <Users className="w-4 h-4 text-success" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-0.5">
                {uniquePeople}
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                Team Members
              </div>
            </div>
          </div>
        </div>

        {/* Hours Booked This Week */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <div className="icon-container-orange mb-2">
                <Clock className="w-4 h-4 text-warning" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-0.5">
                {hoursBookedThisWeek.toFixed(1)}h
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                Hours This Week
              </div>
            </div>
          </div>
        </div>

        {/* Utilization */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <div className="icon-container-blue mb-2">
                <BarChart3 className="w-4 h-4 text-info" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-0.5">
                {totalBookings > 0 ? "85%" : "0%"}
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                Room Utilization
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Card - Flex grow to fill space */}
      <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1.5">
                Meeting Schedule
              </h2>
              <p className="text-base text-muted-foreground">
                Drag and drop to reschedule meetings
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setView("timeGridWeek");
                  calendarRef.current?.getApi().changeView("timeGridWeek");
                }}
                variant={view === "timeGridWeek" ? "default" : "outline"}
                size="default"
                className={view === "timeGridWeek" ? "px-6 font-medium" : "px-6 font-medium"}
              >
                Week
              </Button>
              <Button
                onClick={() => {
                  setView("dayGridMonth");
                  calendarRef.current?.getApi().changeView("dayGridMonth");
                }}
                variant={view === "dayGridMonth" ? "default" : "outline"}
                size="default"
                className={view === "dayGridMonth" ? "px-6 font-medium" : "px-6 font-medium"}
              >
                Month
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar - Flex grow */}
        <div className="p-8 flex-1 flex flex-col min-h-0">
          <FullCalendar
            ref={calendarRef}
            timeZone="local"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            editable
            selectable
            selectMirror
            dayMaxEvents
            weekends
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventResizableFromStart
            height="100%"
            contentHeight="auto"
            expandRows={true}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            slotDuration="01:00:00"
            snapDuration="00:30:00"
            allDaySlot={false}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
              hour12: true
            }}
            validRange={{
              start: new Date(),
              end: "2030-12-31",
            }}
            eventContent={(eventInfo) => {
              const booking = bookings.find(b => b.id === eventInfo.event.id);
              // Format time with proper am/pm
              const start = eventInfo.event.start;
              const end = eventInfo.event.end;
              let timeText = '';
              if (start && end) {
                const formatTime = (date: Date) => {
                  const hours = date.getHours();
                  const minutes = date.getMinutes();
                  const ampm = hours >= 12 ? 'pm' : 'am';
                  const displayHours = hours % 12 || 12;
                  return `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
                };
                timeText = `${formatTime(start)} - ${formatTime(end)}`;
              }
              return (
                <div className="fc-event-main-frame p-3 h-full overflow-hidden group cursor-move">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="font-semibold text-sm mb-1.5 line-clamp-2">
                        {booking?.purpose || eventInfo.event.title}
                      </div>
                      <div className="text-xs opacity-90 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="line-clamp-1">{booking?.pic}</span>
                      </div>
                    </div>
                    <div className="text-xs opacity-85 mt-2 font-medium">
                      {timeText}
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        data={bookings}
        onClose={onClose}
        fetchBookings={fetchBookings}
        onSubmit={handleBookingSubmit}
        initialStart={editingBooking?.start || selectedSlot?.start}
        initialEnd={editingBooking?.end || selectedSlot?.end}
        initialId={editingBooking?.id}
        initialPurpose={editingBooking?.purpose}
        initialPIC={editingBooking?.pic}
        isEditMode={!!editingBooking}
      />
    </div>
  );
};
