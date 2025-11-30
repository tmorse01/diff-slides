"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Project } from "@/types/database"

interface ProjectVisibilitySelectorProps {
  project: Project
}

export function ProjectVisibilitySelector({ project }: ProjectVisibilitySelectorProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentVisibility, setCurrentVisibility] = useState<"private" | "unlisted" | "public">(
    project.visibility
  )

  const handleVisibilityChange = async (newVisibility: "private" | "unlisted" | "public") => {
    if (newVisibility === currentVisibility) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visibility: newVisibility,
        }),
      })

      if (response.ok) {
        setCurrentVisibility(newVisibility)
        router.refresh()
        toast({
          title: "Visibility updated",
          description: `Project visibility changed to ${newVisibility}.`,
        })
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Failed to update visibility",
          description: error.error || "An error occurred while updating visibility.",
        })
      }
    } catch (error) {
      console.error("Error updating visibility:", error)
      toast({
        variant: "destructive",
        title: "Failed to update visibility",
        description: "An error occurred while updating visibility.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentVisibility}
        onValueChange={handleVisibilityChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[140px]">
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <SelectValue>
              <span className="capitalize">{currentVisibility}</span>
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">
            <div className="flex flex-col">
              <span className="font-medium">Private</span>
              <span className="text-xs text-muted-foreground">
                Only you can see it
              </span>
            </div>
          </SelectItem>
          <SelectItem value="unlisted">
            <div className="flex flex-col">
              <span className="font-medium">Unlisted</span>
              <span className="text-xs text-muted-foreground">
                Anyone with the link can see it
              </span>
            </div>
          </SelectItem>
          <SelectItem value="public">
            <div className="flex flex-col">
              <span className="font-medium">Public</span>
              <span className="text-xs text-muted-foreground">
                Everyone can see it
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

