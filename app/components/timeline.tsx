"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Group, ActionIcon, Text } from "@mantine/core"
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
} from "@tabler/icons-react"

interface TimelineProps {
  currentTime: number
  isPlaying: boolean
  onPlayPause: () => void
  media: {
    file: File | null
    url: string | null
    type: "image" | "video" | null
    position: { x: number; y: number }
    size: { width: number; height: number }
    startTime: number
    endTime: number
    visible: boolean
  }
  onTimeChange: (startTime: number, endTime: number) => void
}

export function Timeline({ currentTime, isPlaying, onPlayPause, media, onTimeChange }: TimelineProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)
  const itemRef = useRef<HTMLDivElement>(null)
  const startPositionRef = useRef(0)

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const tenths = Math.floor((time % 1) * 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${tenths}`
  }

  const handleItemMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !itemRef.current) return

    e.stopPropagation()
    e.preventDefault()

    setIsDragging(true)
    setDragStart(e.clientX)

    const timelineRect = timelineRef.current.getBoundingClientRect()
    const itemRect = itemRef.current.getBoundingClientRect()
    startPositionRef.current = (itemRect.left - timelineRect.left) / timelineRect.width
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !timelineRef.current || !media.file) return

    const timelineRect = timelineRef.current.getBoundingClientRect()
    const deltaX = e.clientX - dragStart
    const deltaRatio = deltaX / timelineRect.width

    const duration = 60 // Total timeline duration in seconds
    const itemDuration = media.endTime - media.startTime

    let newStartTime = Math.max(0, startPositionRef.current * duration + deltaRatio * duration)
    newStartTime = Math.min(newStartTime, duration - itemDuration)
    const newEndTime = newStartTime + itemDuration

    onTimeChange(Number.parseFloat(newStartTime.toFixed(1)), Number.parseFloat(newEndTime.toFixed(1)))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  // Generate ruler marks
  const rulerMarks = []
  for (let i = 0; i <= 60; i++) {
    const isMajor = i % 10 === 0
    rulerMarks.push(
      <div key={i} className={`timeline-ruler-mark ${isMajor ? "major" : ""}`} style={{ left: `${(i / 60) * 100}%` }}>
        {isMajor && <div className="timeline-ruler-label">{i}s</div>}
      </div>,
    )
  }

  return (
    <div className="timeline">
      <Group position="apart" p="xs">
        <Group>
          <ActionIcon variant="subtle" onClick={onPlayPause}>
            {isPlaying ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
          </ActionIcon>
          <ActionIcon variant="subtle">
            <IconPlayerSkipBack size={20} />
          </ActionIcon>
          <ActionIcon variant="subtle">
            <IconPlayerSkipForward size={20} />
          </ActionIcon>
          <Text size="sm">
            {formatTime(currentTime)} / {formatTime(60)}
          </Text>
        </Group>

        <Group>
          <ActionIcon variant="subtle">
            <IconZoomIn size={20} />
          </ActionIcon>
          <ActionIcon variant="subtle">
            <IconZoomOut size={20} />
          </ActionIcon>
          <ActionIcon variant="subtle">
            <IconMaximize size={20} />
          </ActionIcon>
          <Text size="sm" fw={500}>
            Fit
          </Text>
        </Group>
      </Group>

      <div className="timeline-ruler">{rulerMarks}</div>

      <div className="timeline-track" ref={timelineRef}>
        {media.file && (
          <div
            ref={itemRef}
            className="timeline-item"
            style={{
              left: `${(media.startTime / 60) * 100}%`,
              width: `${((media.endTime - media.startTime) / 60) * 100}%`,
            }}
            onMouseDown={handleItemMouseDown}
          >
            {media.file.name.length > 15 ? `${media.file.name.substring(0, 15)}...` : media.file.name}
          </div>
        )}

        {/* Current time indicator */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${(currentTime / 60) * 100}%`,
            width: "2px",
            backgroundColor: "#ff4d4f",
            zIndex: 10,
          }}
        />
      </div>

      {!media.file && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "40px",
            color: "#666",
          }}
        >
          + Add media to this project
        </div>
      )}
    </div>
  )
}

