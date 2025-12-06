import { requireAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProjectsService } from "@/lib/services/projects.service";
import { ProjectsList } from "@/components/projects-list";

export default async function ProjectsPage() {
  const user = await requireAuth();

  // Get projects using typed service
  const projects = await ProjectsService.getByUserId(user.id);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your code tutorial projects
            </p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        <ProjectsList projects={projects} />
      </div>
    </div>
  );
}
