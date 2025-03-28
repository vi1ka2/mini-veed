"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button, TextInput, NumberInput, Group, Text, ActionIcon, Slider, Switch, FileButton } from "@mantine/core"
import {
  IconUpload,
  IconMicrophone,
  IconBrandCodesandbox,
  IconMessageCircle2,
  IconMicrophone2,
  IconUser,
  IconEye,
  IconSettings,
  IconSearch,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconAlertCircle,
  IconCheck,
  IconTrash,
  IconDotsVertical,
} from "@tabler/icons-react"

export default function Home() {
  const [mediaItems, setMediaItems] = useState<
    Array<{
      id: string
      file: File
      url: string
      type: "image" | "video"
      position: { x: number; y: number }
      size: { width: number; height: number }
      startTime: number
      endTime: number
      visible: boolean
      selected: boolean
    }>
  >([])

  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [projectName, setProjectName] = useState("signature")
  const [rotation, setRotation] = useState("0°")
  const [opacity, setOpacity] = useState(100)
  const [roundCorners, setRoundCorners] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith("image/") ? "image" : "video"

      // Create an element to get natural dimensions
      if (type === "image") {
        const img = new Image()
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight
          const width = 320
          const height = width / aspectRatio

          const newMedia = {
            id: Date.now().toString(),
            file,
            url,
            type,
            position: { x: 0, y: 0 },
            size: { width, height },
            startTime: 0,
            endTime: 1,
            visible: true,
            selected: true,
          }

          // Deselect all other media items
          setMediaItems((prev) => prev.map((item) => ({ ...item, selected: false })).concat(newMedia))
        }
        img.src = url
      } else {
        // Default size for video
        const newMedia = {
          id: Date.now().toString(),
          file,
          url,
          type,
          position: { x: 0, y: 0 },
          size: { width: 320, height: 180 },
          startTime: 0,
          endTime: 1,
          visible: true,
          selected: true,
        }

        // Deselect all other media items
        setMediaItems((prev) => prev.map((item) => ({ ...item, selected: false })).concat(newMedia))
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(Array.from(e.dataTransfer.files))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleSelectMedia = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: item.id === id,
      })),
    )
  }

  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setMediaItems((prev) => prev.map((item) => (item.id === id ? { ...item, position: newPosition } : item)))
  }

  const handleSizeChange = (id: string, newSize: { width: number; height: number }) => {
    setMediaItems((prev) => prev.map((item) => (item.id === id ? { ...item, size: newSize } : item)))
  }

  const handleTimeChange = (id: string, startTime: number, endTime: number) => {
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              startTime,
              endTime,
              // Update visibility based on current time
              visible: currentTime >= startTime && currentTime <= endTime,
            }
          : item,
      ),
    )
  }

  const handleDeleteMedia = (id: string) => {
    setMediaItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      // Select the last item if available
      if (filtered.length > 0) {
        filtered[filtered.length - 1].selected = true
      }
      return filtered
    })
  }

  const togglePlayback = () => {
    if (isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsPlaying(false)
    } else {
      // Reset time to 0 when starting playback
      setCurrentTime(0)

      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1
          if (newTime >= 60) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            setIsPlaying(false)
            return 0
          }
          return Number.parseFloat(newTime.toFixed(1))
        })
      }, 100)
      setIsPlaying(true)
    }
  }

  // Update media visibility based on current time
  useEffect(() => {
    setMediaItems((prev) =>
      prev.map((item) => ({
        ...item,
        visible: currentTime >= item.startTime && currentTime <= item.endTime,
      })),
    )
  }, [currentTime])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      mediaItems.forEach((item) => {
        URL.revokeObjectURL(item.url)
      })
    }
  }, [mediaItems])

  const selectedMedia = mediaItems.find((item) => item.selected)

  // Format time as MM:SS.S
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const tenths = Math.floor((time % 1) * 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${tenths}`
  }

  return (
    <div className="editor-container">
      {/* Notification Bar */}
      <div className="notification-bar">
        <Group>
          <IconAlertCircle size={16} />
          <Text size="sm">Auto-save is turned off — your changes won't be saved.</Text>
        </Group>
        <Button variant="filled" color="red" size="xs">
          Refresh
        </Button>
      </div>

      {/* Top Bar */}
      <div className="top-bar">
        <Group>
          <IconSettings size={20} stroke={1.5} />
          <Text size="md" fw={500}>
            {projectName}
          </Text>
          <ActionIcon variant="subtle">
            <IconArrowBackUp size={20} stroke={1.5} />
          </ActionIcon>
          <ActionIcon variant="subtle">
            <IconArrowForwardUp size={20} stroke={1.5} />
          </ActionIcon>
        </Group>

        <Group>
          <ActionIcon variant="subtle">
            <IconSearch size={20} stroke={1.5} />
          </ActionIcon>
          <ActionIcon variant="subtle">
            <IconEye size={20} stroke={1.5} />
          </ActionIcon>
          <Text size="sm" c="dimmed">
            Save your project for later —
          </Text>
          <Button variant="subtle" color="blue" size="xs">
            sign up
          </Button>
          <Text size="sm">or</Text>
          <Button variant="subtle" color="blue" size="xs">
            log in
          </Button>
          <Button className="done-button" size="sm" rightSection={<IconCheck size={16} />}>
            Done
          </Button>
        </Group>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          {selectedMedia ? (
            <div>
              <div className="sidebar-section">
                <h2 className="sidebar-section-title">
                  Edit {selectedMedia.type === "image" ? "Image" : "Video"}
                  <span style={{ fontWeight: "normal", fontSize: "12px", color: "#666", marginLeft: "5px" }}>
                    {selectedMedia.file.name.length > 20
                      ? `${selectedMedia.file.name.substring(0, 20)}...`
                      : selectedMedia.file.name}
                  </span>
                </h2>

                <Group grow mb="md">
                  <Button variant="light" leftSection={<IconUpload size={16} />} size="md">
                    Animations
                  </Button>
                  <Button variant="light" leftSection={<IconSettings size={16} />} size="md">
                    Adjust
                  </Button>
                </Group>

                <div className="input-group">
                  <Group position="apart">
                    <Text size="sm">Round Corners</Text>
                    <Switch
                      size="sm"
                      checked={roundCorners}
                      onChange={(event) => setRoundCorners(event.currentTarget.checked)}
                    />
                  </Group>
                </div>

                <div className="input-group">
                  <Text size="sm" mb="xs">
                    Opacity
                  </Text>
                  <Slider
                    value={opacity}
                    onChange={setOpacity}
                    marks={[]}
                    min={0}
                    max={100}
                    label={(value) => `${value}%`}
                  />
                </div>

                <div className="input-group">
                  <Text size="sm" mb="xs">
                    Rotation
                  </Text>
                  <TextInput value={rotation} onChange={(e) => setRotation(e.currentTarget.value)} />
                </div>

                <div className="input-group">
                  <Text size="sm" mb="xs">
                    Size
                  </Text>
                  <Group grow>
                    <NumberInput
                      label="Width"
                      value={selectedMedia.size.width}
                      onChange={(value) => {
                        if (value !== undefined) {
                          handleSizeChange(selectedMedia.id, {
                            width: Number(value),
                            height: selectedMedia.size.height,
                          })
                        }
                      }}
                      min={10}
                      max={1000}
                      step={1}
                    />
                    <NumberInput
                      label="Height"
                      value={selectedMedia.size.height}
                      onChange={(value) => {
                        if (value !== undefined) {
                          handleSizeChange(selectedMedia.id, {
                            width: selectedMedia.size.width,
                            height: Number(value),
                          })
                        }
                      }}
                      min={10}
                      max={1000}
                      step={1}
                    />
                  </Group>
                </div>

                <div className="input-group">
                  <Text size="sm" mb="xs">
                    Timing
                  </Text>
                  <Group grow>
                    <NumberInput
                      label="Start"
                      value={selectedMedia.startTime}
                      onChange={(value) => {
                        if (value !== undefined) {
                          const newStartTime = Number(value)
                          handleTimeChange(
                            selectedMedia.id,
                            newStartTime,
                            Math.max(newStartTime + 0.1, selectedMedia.endTime),
                          )
                        }
                      }}
                      min={0}
                      max={59.9}
                      step={0.1}
                      precision={1}
                      rightSection="s"
                    />
                    <NumberInput
                      label="End"
                      value={selectedMedia.endTime}
                      onChange={(value) => {
                        if (value !== undefined) {
                          const newEndTime = Number(value)
                          handleTimeChange(
                            selectedMedia.id,
                            Math.min(newEndTime - 0.1, selectedMedia.startTime),
                            newEndTime,
                          )
                        }
                      }}
                      min={0.1}
                      max={60}
                      step={0.1}
                      precision={1}
                      rightSection="s"
                    />
                  </Group>
                </div>
              </div>

              <div className="sidebar-section">
                <h2 className="sidebar-section-title">Media</h2>
                <Group>
                  <FileButton onChange={(files) => files && handleFileUpload([files])}>
                    {(props) => (
                      <Button variant="light" {...props} style={{ flex: 1 }}>
                        Replace Image
                      </Button>
                    )}
                  </FileButton>
                  <ActionIcon variant="light" color="red" onClick={() => handleDeleteMedia(selectedMedia.id)}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>

                <div
                  className="upload-area"
                  style={{ marginTop: "16px" }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(Array.from(e.target.files))
                      }
                    }}
                    accept="image/*,video/*"
                  />
                  <IconUpload size={24} className="upload-icon" />
                  <Text size="sm" fw={500}>
                    Upload another file
                  </Text>
                  <Text size="xs" c="dimmed">
                    Drag & drop or click to browse
                  </Text>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="sidebar-section">
                <h2 className="sidebar-section-title">Add Media</h2>

                <div
                  className="upload-area"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(Array.from(e.target.files))
                      }
                    }}
                    accept="image/*,video/*"
                  />
                  <IconUpload size={32} className="upload-icon" />
                  <Text size="md" fw={500}>
                    Upload a File
                  </Text>
                  <Text size="sm" c="dimmed">
                    Drag & drop a file
                  </Text>
                  <Text size="sm" c="blue">
                    or import from a link
                  </Text>
                </div>
              </div>

              <div className="sidebar-section">
                <Group grow>
                  <Button variant="light" leftSection={<IconMicrophone size={16} />} size="md">
                    Record
                  </Button>
                  <Button variant="light" leftSection={<IconBrandCodesandbox size={16} />} size="md">
                    Brand Kits
                  </Button>
                </Group>

                <Group grow mt="md">
                  <Button variant="light" leftSection={<IconMessageCircle2 size={16} />} size="md">
                    Text To Speech
                  </Button>
                  <Button
                    variant="light"
                    leftSection={<IconMicrophone2 size={16} />}
                    size="md"
                    rightSection={<span className="sidebar-option-badge">NEW</span>}
                  >
                    Voice Clone
                  </Button>
                </Group>
              </div>

              <div className="sidebar-section">
                <Group position="apart">
                  <h2 className="sidebar-section-title">AI Avatars</h2>
                  <Button variant="subtle" size="xs">
                    View All
                  </Button>
                </Group>

                <div className="avatar-grid">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="avatar-item">
                      <img src={`/placeholder.svg?height=100&width=100`} alt={`Avatar ${i}`} />
                      <div className="avatar-badge">
                        <IconUser size={10} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="canvas-area">
          <div className="canvas-container" ref={canvasRef} onDrop={handleDrop} onDragOver={handleDragOver}>
            <div className="canvas">
              {mediaItems.map(
                (item) =>
                  item.visible && (
                    <div
                      key={item.id}
                      className={`media-item ${item.selected ? "selected" : ""}`}
                      style={{
                        left: `${item.position.x}px`,
                        top: `${item.position.y}px`,
                        width: `${item.size.width}px`,
                        height: `${item.size.height}px`,
                        zIndex: item.selected ? 10 : 1,
                        borderRadius: item.selected && roundCorners ? "8px" : "0",
                        opacity: item.selected ? opacity / 100 : 1,
                        transform: item.selected ? `rotate(${rotation})` : "none",
                      }}
                      onClick={() => handleSelectMedia(item.id)}
                      onMouseDown={(e) => {
                        if (!item.selected) {
                          handleSelectMedia(item.id)
                        }

                        const startX = e.clientX
                        const startY = e.clientY
                        const startPos = { ...item.position }

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX
                          const deltaY = moveEvent.clientY - startY

                          handlePositionChange(item.id, {
                            x: startPos.x + deltaX,
                            y: startPos.y + deltaY,
                          })
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                      }}
                    >
                      {item.type === "image" && (
                        <img
                          src={item.url || "/placeholder.svg"}
                          alt="Media"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: item.selected && roundCorners ? "8px" : "0",
                          }}
                          draggable={false}
                        />
                      )}

                      {item.type === "video" && (
                        <video
                          src={item.url}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: item.selected && roundCorners ? "8px" : "0",
                          }}
                          controls={false}
                          draggable={false}
                          autoPlay={isPlaying}
                          muted
                          loop
                        />
                      )}

                      {item.selected && (
                        <>
                          {/* Resize handles */}
                          <div
                            className="resize-handle top-left"
                            onMouseDown={(e) => {
                              e.stopPropagation()

                              const startX = e.clientX
                              const startY = e.clientY
                              const startPos = { ...item.position }
                              const startSize = { ...item.size }

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX
                                const deltaY = moveEvent.clientY - startY

                                const newWidth = Math.max(50, startSize.width - deltaX)
                                const newHeight = Math.max(50, startSize.height - deltaY)
                                const newX = startPos.x + (startSize.width - newWidth)
                                const newY = startPos.y + (startSize.height - newHeight)

                                handlePositionChange(item.id, { x: newX, y: newY })
                                handleSizeChange(item.id, { width: newWidth, height: newHeight })
                              }

                              const handleMouseUp = () => {
                                document.removeEventListener("mousemove", handleMouseMove)
                                document.removeEventListener("mouseup", handleMouseUp)
                              }

                              document.addEventListener("mousemove", handleMouseMove)
                              document.addEventListener("mouseup", handleMouseUp)
                            }}
                          />
                          <div
                            className="resize-handle top-right"
                            onMouseDown={(e) => {
                              e.stopPropagation()

                              const startX = e.clientX
                              const startY = e.clientY
                              const startPos = { ...item.position }
                              const startSize = { ...item.size }

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX
                                const deltaY = moveEvent.clientY - startY

                                const newWidth = Math.max(50, startSize.width + deltaX)
                                const newHeight = Math.max(50, startSize.height - deltaY)
                                const newY = startPos.y + (startSize.height - newHeight)

                                handlePositionChange(item.id, { x: startPos.x, y: newY })
                                handleSizeChange(item.id, { width: newWidth, height: newHeight })
                              }

                              const handleMouseUp = () => {
                                document.removeEventListener("mousemove", handleMouseMove)
                                document.removeEventListener("mouseup", handleMouseUp)
                              }

                              document.addEventListener("mousemove", handleMouseMove)
                              document.addEventListener("mouseup", handleMouseUp)
                            }}
                          />
                          <div
                            className="resize-handle bottom-left"
                            onMouseDown={(e) => {
                              e.stopPropagation()

                              const startX = e.clientX
                              const startY = e.clientY
                              const startPos = { ...item.position }
                              const startSize = { ...item.size }

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX
                                const deltaY = moveEvent.clientY - startY

                                const newWidth = Math.max(50, startSize.width - deltaX)
                                const newHeight = Math.max(50, startSize.height + deltaY)
                                const newX = startPos.x + (startSize.width - newWidth)

                                handlePositionChange(item.id, { x: newX, y: startPos.y })
                                handleSizeChange(item.id, { width: newWidth, height: newHeight })
                              }

                              const handleMouseUp = () => {
                                document.removeEventListener("mousemove", handleMouseMove)
                                document.removeEventListener("mouseup", handleMouseUp)
                              }

                              document.addEventListener("mousemove", handleMouseMove)
                              document.addEventListener("mouseup", handleMouseUp)
                            }}
                          />
                          <div
                            className="resize-handle bottom-right"
                            onMouseDown={(e) => {
                              e.stopPropagation()

                              const startX = e.clientX
                              const startY = e.clientY
                              const startSize = { ...item.size }

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX
                                const deltaY = moveEvent.clientY - startY

                                const newWidth = Math.max(50, startSize.width + deltaX)
                                const newHeight = Math.max(50, startSize.height + deltaY)

                                handleSizeChange(item.id, { width: newWidth, height: newHeight })
                              }

                              const handleMouseUp = () => {
                                document.removeEventListener("mousemove", handleMouseMove)
                                document.removeEventListener("mouseup", handleMouseUp)
                              }

                              document.addEventListener("mousemove", handleMouseMove)
                              document.addEventListener("mouseup", handleMouseUp)
                            }}
                          />
                          <div
                            className="resize-handle top-center"
                            onMouseDown={(e) => {
                              e.stopPropagation()

                              const startY = e.clientY
                              const startPos = { ...item.position }
                              const startSize = { ...item.size }

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaY = moveEvent.clientY - startY

                                const newHeight = Math.max(50, startSize.height - deltaY)
                                const newY = startPos.y + (startSize.height - newHeight)

                                handlePositionChange(item.id, { x: startPos.x, y: newY })
                                handleSizeChange(item.id, { width: startSize.width, height: newHeight })
                              }

                              const handleMouseUp = () => {
                                document.removeEventListener("mousemove", handleMouseMove)
                                document.removeEventListener("mouseup", handleMouseUp)
                              }

                              document.addEventListener("mousemove", handleMouseMove)
                              document.addEventListener("mouseup", handleMouseUp)
                            }}
                          />
                          <div
                            className="resize-handle bottom-center"
                            onMouseDown={(e) => {
                              e.stopPropagation()

                              const startY = e.clientY
                              const startSize = { ...item.size }

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaY = moveEvent.clientY - startY

                                const newHeight = Math.max(50, startSize.height + deltaY)

                                handleSizeChange(item.id, { width: startSize.width, height: newHeight })
                              }

                              const handleMouseUp = () => {
                                document.removeEventListener("mousemove", handleMouseMove)
                                document.removeEventListener("mouseup", handleMouseUp)
                              }

                              document.addEventListener("mousemove", handleMouseMove)
                              document.addEventListener("mouseup", handleMouseUp)
                            }}
                          />
                          <div
                            className="resize-handle left-center"
                            onMouseDown={(e) => {
                              e.stopPropagation()

                              const startX = e.clientX
                              const startPos = { ...item.position }
                              const startSize = { ...item.size }

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX

                                const newWidth = Math.max(50, startSize.width - deltaX)
                                const newX = startPos.x + (startSize.width - newWidth)

                                handlePositionChange(item.id, { x: newX, y: startPos.y })
                                handleSizeChange(item.id, { width: newWidth, height: startSize.height })
                              }

                              const handleMouseUp = () => {
                                document.removeEventListener("mousemove", handleMouseMove)
                                document.removeEventListener("mouseup", handleMouseUp)
                              }

                              document.addEventListener("mousemove", handleMouseMove)
                              document.addEventListener("mouseup", handleMouseUp)
                            }}
                          />
                          <div
                            className="resize-handle right-center"
                            onMouseDown={(e) => {
                              e.stopPropagation()

                              const startX = e.clientX
                              const startSize = { ...item.size }

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX

                                const newWidth = Math.max(50, startSize.width + deltaX)

                                handleSizeChange(item.id, { width: newWidth, height: startSize.height })
                              }

                              const handleMouseUp = () => {
                                document.removeEventListener("mousemove", handleMouseMove)
                                document.removeEventListener("mouseup", handleMouseUp)
                              }

                              document.addEventListener("mousemove", handleMouseMove)
                              document.addEventListener("mouseup", handleMouseUp)
                            }}
                          />

                          {/* Media controls */}
                          <div className="media-controls">
                            <Group spacing="xs">
                              <Button variant="white" size="xs" leftSection={<IconUpload size={14} />}>
                                Animation
                              </Button>
                              <Button variant="white" size="xs" leftSection={<IconSettings size={14} />}>
                                Adjust
                              </Button>
                              <ActionIcon variant="white" size="sm">
                                <IconDotsVertical size={14} />
                              </ActionIcon>
                            </Group>
                          </div>
                        </>
                      )}
                    </div>
                  ),
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline">
            <Group position="apart" p="xs">
              <Group>
                <ActionIcon variant="subtle" onClick={togglePlayback}>
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

            <div className="timeline-ruler">
              {Array.from({ length: 61 }).map((_, i) => {
                const isMajor = i % 10 === 0
                return (
                  <div
                    key={i}
                    className={`timeline-ruler-mark ${isMajor ? "major" : ""}`}
                    style={{ left: `${(i / 60) * 100}%` }}
                  >
                    {isMajor && <div className="timeline-ruler-label">{i}s</div>}
                  </div>
                )
              })}

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

            <div className="timeline-track">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className={`timeline-item ${item.selected ? "selected" : ""}`}
                  style={{
                    left: `${(item.startTime / 60) * 100}%`,
                    width: `${((item.endTime - item.startTime) / 60) * 100}%`,
                  }}
                  onClick={() => handleSelectMedia(item.id)}
                  onMouseDown={(e) => {
                    e.stopPropagation()

                    if (!item.selected) {
                      handleSelectMedia(item.id)
                    }

                    const timelineRect = e.currentTarget.parentElement?.getBoundingClientRect()
                    if (!timelineRect) return

                    const startX = e.clientX
                    const itemStartTime = item.startTime
                    const itemDuration = item.endTime - item.startTime

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaX = moveEvent.clientX - startX
                      const deltaTime = (deltaX / timelineRect.width) * 60

                      let newStartTime = Math.max(0, itemStartTime + deltaTime)
                      newStartTime = Math.min(newStartTime, 60 - itemDuration)
                      const newEndTime = newStartTime + itemDuration

                      handleTimeChange(
                        item.id,
                        Number.parseFloat(newStartTime.toFixed(1)),
                        Number.parseFloat(newEndTime.toFixed(1)),
                      )
                    }

                    const handleMouseUp = () => {
                      document.removeEventListener("mousemove", handleMouseMove)
                      document.removeEventListener("mouseup", handleMouseUp)
                    }

                    document.addEventListener("mousemove", handleMouseMove)
                    document.addEventListener("mouseup", handleMouseUp)
                  }}
                >
                  {item.file.name.length > 15 ? `${item.file.name.substring(0, 15)}...` : item.file.name}
                </div>
              ))}
            </div>

            {mediaItems.length === 0 && (
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
        </div>
      </div>
    </div>
  )
}

