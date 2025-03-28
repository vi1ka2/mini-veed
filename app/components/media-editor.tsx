"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ActionIcon, Group } from "@mantine/core"
import { IconWand, IconAdjustments, IconDotsVertical } from "@tabler/icons-react"

interface MediaEditorProps {
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
  onPositionChange: (newPosition: { x: number; y: number }) => void
  onSizeChange: (newSize: { width: number; height: number }) => void
}

export function MediaEditor({ media, onPositionChange, onSizeChange }: MediaEditorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mediaRef = useRef<HTMLDivElement>(null)
  const startPositionRef = useRef(media.position)
  const startSizeRef = useRef(media.size)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()

    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
    startPositionRef.current = media.position
  }

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    e.stopPropagation()
    e.preventDefault()

    setIsResizing(true)
    setResizeDirection(direction)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
    startSizeRef.current = media.size
    startPositionRef.current = media.position
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      onPositionChange({
        x: startPositionRef.current.x + deltaX,
        y: startPositionRef.current.y + deltaY,
      })
    } else if (isResizing && resizeDirection) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      let newWidth = startSizeRef.current.width
      let newHeight = startSizeRef.current.height
      let newX = startPositionRef.current.x
      let newY = startPositionRef.current.y

      if (resizeDirection.includes("right")) {
        newWidth = Math.max(50, startSizeRef.current.width + deltaX)
      }

      if (resizeDirection.includes("bottom")) {
        newHeight = Math.max(50, startSizeRef.current.height + deltaY)
      }

      if (resizeDirection.includes("left")) {
        newWidth = Math.max(50, startSizeRef.current.width - deltaX)
        newX = startPositionRef.current.x + (startSizeRef.current.width - newWidth)
      }

      if (resizeDirection.includes("top")) {
        newHeight = Math.max(50, startSizeRef.current.height - deltaY)
        newY = startPositionRef.current.y + (startSizeRef.current.height - newHeight)
      }

      onPositionChange({ x: newX, y: newY })
      onSizeChange({ width: newWidth, height: newHeight })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection(null)
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing])

  if (!media.visible) {
    return null
  }

  return (
    <div
      ref={mediaRef}
      className={`media-item ${isDragging || isResizing ? "selected" : ""}`}
      style={{
        left: `${media.position.x}px`,
        top: `${media.position.y}px`,
        width: `${media.size.width}px`,
        height: `${media.size.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {media.type === "image" && media.url && (
        <img
          src={media.url || "/placeholder.svg"}
          alt="Media"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}

      {media.type === "video" && media.url && (
        <video src={media.url} style={{ width: "100%", height: "100%", objectFit: "contain" }} controls={false} />
      )}

      {/* Resize handles */}
      <div className="resize-handle top-left" onMouseDown={(e) => handleResizeStart(e, "top-left")} />
      <div className="resize-handle top-right" onMouseDown={(e) => handleResizeStart(e, "top-right")} />
      <div className="resize-handle bottom-left" onMouseDown={(e) => handleResizeStart(e, "bottom-left")} />
      <div className="resize-handle bottom-right" onMouseDown={(e) => handleResizeStart(e, "bottom-right")} />
      <div className="resize-handle top-center" onMouseDown={(e) => handleResizeStart(e, "top")} />
      <div className="resize-handle bottom-center" onMouseDown={(e) => handleResizeStart(e, "bottom")} />
      <div className="resize-handle left-center" onMouseDown={(e) => handleResizeStart(e, "left")} />
      <div className="resize-handle right-center" onMouseDown={(e) => handleResizeStart(e, "right")} />

      {/* Media controls */}
      <div className="media-controls">
        <Group spacing="xs">
          <ActionIcon variant="filled" color="white" radius="xl" size="sm">
            <IconWand size={16} />
          </ActionIcon>
          <ActionIcon variant="filled" color="white" radius="xl" size="sm">
            <IconAdjustments size={16} />
          </ActionIcon>
          <ActionIcon variant="filled" color="white" radius="xl" size="sm">
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Group>
      </div>
    </div>
  )
}

