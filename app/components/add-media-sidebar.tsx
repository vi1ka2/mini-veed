"use client"

import { Button, Text, Group } from "@mantine/core"
import {
  IconUpload,
  IconMicrophone,
  IconBrandCodesandbox,
  IconMessageCircle2,
  IconMicrophone2,
  IconUser,
} from "@tabler/icons-react"
import { useDropzone } from "../hooks/use-dropzone"

interface AddMediaSidebarProps {
  onDrop: (acceptedFiles: File[]) => void
}

export function AddMediaSidebar({ onDrop }: AddMediaSidebarProps) {
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <div>
      <div className="sidebar-section">
        <h2 className="sidebar-section-title">Add Media</h2>

        <div {...getRootProps()} className="upload-area">
          <input {...getInputProps()} />
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
  )
}

