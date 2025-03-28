"use client"

import { useState } from "react"
import { Button, TextInput, NumberInput, Group, Text, Slider, Switch } from "@mantine/core"
import { IconWand, IconAdjustments } from "@tabler/icons-react"

interface EditMediaSidebarProps {
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
  onSizeChange: (newSize: { width: number; height: number }) => void
  onTimeChange: (startTime: number, endTime: number) => void
}

export function EditMediaSidebar({ media, onSizeChange, onTimeChange }: EditMediaSidebarProps) {
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const aspectRatio = media.size.width / media.size.height

  const handleWidthChange = (value: number) => {
    if (maintainAspectRatio) {
      const height = Math.round(value / aspectRatio)
      onSizeChange({ width: value, height })
    } else {
      onSizeChange({ ...media.size, width: value })
    }
  }

  const handleHeightChange = (value: number) => {
    if (maintainAspectRatio) {
      const width = Math.round(value * aspectRatio)
      onSizeChange({ width, height: value })
    } else {
      onSizeChange({ ...media.size, height: value })
    }
  }

  const handleStartTimeChange = (value: number) => {
    onTimeChange(value, Math.max(value + 0.1, media.endTime))
  }

  const handleEndTimeChange = (value: number) => {
    onTimeChange(Math.min(value - 0.1, media.startTime), value)
  }

  const fileName = media.file ? media.file.name : ""
  const title = media.type === "image" ? `Edit Image` : "Edit Video"
  const subtitle = fileName.length > 20 ? `${fileName.substring(0, 20)}...` : fileName

  return (
    <div>
      <div className="sidebar-section">
        <h2 className="sidebar-section-title">
          {title} <span style={{ fontWeight: "normal", fontSize: "12px", color: "#666" }}>{subtitle}</span>
        </h2>

        <Group grow mb="md">
          <Button variant="light" leftSection={<IconWand size={16} />} size="md">
            Animations
          </Button>
          <Button variant="light" leftSection={<IconAdjustments size={16} />} size="md">
            Adjust
          </Button>
        </Group>

        <div className="input-group">
          <Group position="apart">
            <Text size="sm">Round Corners</Text>
            <Switch size="sm" />
          </Group>
        </div>

        <div className="input-group">
          <Text size="sm" mb="xs">
            Opacity
          </Text>
          <Slider defaultValue={100} marks={[]} />
        </div>

        <div className="input-group">
          <Text size="sm" mb="xs">
            Rotation
          </Text>
          <TextInput value="0°" />
        </div>

        <div className="input-group">
          <Text size="sm" mb="xs">
            Size
          </Text>
          <Group grow>
            <NumberInput
              label="Width"
              value={media.size.width}
              onChange={(value) => handleWidthChange(Number(value))}
              min={10}
              max={1000}
              step={1}
            />
            <NumberInput
              label="Height"
              value={media.size.height}
              onChange={(value) => handleHeightChange(Number(value))}
              min={10}
              max={1000}
              step={1}
            />
          </Group>
          <Group position="apart" mt="xs">
            <Text size="xs">Maintain aspect ratio</Text>
            <Switch
              size="xs"
              checked={maintainAspectRatio}
              onChange={(event) => setMaintainAspectRatio(event.currentTarget.checked)}
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
              value={media.startTime}
              onChange={(value) => handleStartTimeChange(Number(value))}
              min={0}
              max={59.9}
              step={0.1}
              precision={1}
              rightSection="s"
            />
            <NumberInput
              label="End"
              value={media.endTime}
              onChange={(value) => handleEndTimeChange(Number(value))}
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
        <Button variant="light" fullWidth>
          Replace Image
        </Button>
      </div>
    </div>
  )
}

