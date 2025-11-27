/**
 * TIME PICKER COMPONENT
 * 
 * This component provides a time selection interface using three dropdowns
 * for hours, minutes, and AM/PM selection. It handles 12-hour format conversion
 * and provides a user-friendly time selection experience.
 * 
 * PURPOSE:
 * - Provides intuitive time selection for forms and schedules
 * - Handles 12-hour format with AM/PM selection
 * - Converts between 12-hour display and 24-hour storage format
 * - Supports disabled state for read-only scenarios
 * 
 * FUNCTIONALITY:
 * - Three separate dropdowns for hour, minute, and AM/PM
 * - Automatic conversion between 12-hour and 24-hour formats
 * - Proper initialization from existing time values
 * - Real-time updates to parent component
 * - Disabled state support
 * 
 * DESIGN FEATURES:
 * - Clock icon for visual context
 * - Compact dropdown design
 * - Consistent styling with other form elements
 * - Proper spacing and alignment
 * - Responsive design for different screen sizes
 * 
 * USAGE:
 * Used in timetable creation, schedule management, and other
 * time-related forms throughout the school management system.
 */

"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * Props interface for TimePicker component
 */
interface TimePickerProps {
  value: string;                    // Current time value in "HH:MM AM/PM" format
  onChange: (value: string) => void; // Callback when time changes
  disabled?: boolean;               // Whether the picker is disabled
}

/**
 * TimePicker Component
 * 
 * Provides a three-dropdown interface for selecting time in 12-hour format.
 * Automatically handles conversion between display format and internal storage.
 * 
 * @param props - TimePickerProps object containing component configuration
 * @returns JSX element representing a time picker interface
 */
export default function TimePicker({ value, onChange }: TimePickerProps) {
  // Internal state for hour, minute, and AM/PM
  const [hour, setHour] = React.useState("12")
  const [minute, setMinute] = React.useState("00")
  const [ampm, setAmpm] = React.useState("AM")
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Parse existing value only once when component mounts
  React.useEffect(() => {
    if (value && !isInitialized) {
      const [time] = value.split(' ')
      const [h, m] = time.split(':')
      const hourNum = parseInt(h)
      
      // Convert 24-hour format to 12-hour format
      if (hourNum === 0) {
        setHour("12")
        setAmpm("AM")
      } else if (hourNum < 12) {
        setHour(hourNum.toString().padStart(2, "0"))
        setAmpm("AM")
      } else if (hourNum === 12) {
        setHour("12")
        setAmpm("PM")
      } else {
        setHour((hourNum - 12).toString().padStart(2, "0"))
        setAmpm("PM")
      }
      setMinute(m)
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  // Update parent when time changes - only after initialization
  React.useEffect(() => {
    if (isInitialized) {
      let h = parseInt(hour)
      // Convert 12-hour format to 24-hour format
      if (ampm === "PM" && h < 12) h += 12
      if (ampm === "AM" && h === 12) h = 0
      
      const timeString = `${h.toString().padStart(2, "0")}:${minute} ${ampm}`
      onChange(timeString)
    }
  }, [hour, minute, ampm, isInitialized, onChange])

  // Event handlers for dropdown changes
  const handleHourChange = (newHour: string) => {
    setHour(newHour)
  }

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute)
  }

  const handleAmpmChange = (newAmpm: string) => {
    setAmpm(newAmpm)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Clock icon for visual context */}
      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      
      {/* Hour selection dropdown */}
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[62px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-32 overflow-y-auto">
          {Array.from({ length: 12 }, (_, i) => {
            const h = i + 1
            return (
              <SelectItem key={h} value={h.toString().padStart(2, "0")}>
                {h.toString().padStart(2, "0")}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* Time separator */}
      <span>:</span>

      {/* Minute selection dropdown */}
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-[70px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-32 overflow-y-auto">
          {Array.from({ length: 60 }, (_, i) => {
            const m = i.toString().padStart(2, "0")
            return (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* AM/PM selection dropdown */}
      <Select value={ampm} onValueChange={handleAmpmChange}>
        <SelectTrigger className="w-[70px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-32 overflow-y-auto">
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
