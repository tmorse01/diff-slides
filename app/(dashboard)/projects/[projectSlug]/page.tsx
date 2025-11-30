import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { ArrowLeft, Edit, Eye } from "lucide-react";
import type { Project, Step } from "@/types/database";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectSlug: string }> | { projectSlug: string };
}) {
  const user = await requireAuth();
  const supabase = await createClient();
  const resolvedParams = params instanceof Promise ? await params : params;
  const { projectSlug } = resolvedParams;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", projectSlug)
    .single();

  if (error || !project) {
    throw new NotFoundError("Project not found");
  }

  const typedProject = project as Project;

  // Check if user owns the project or if it's public/unlisted
  const isOwner = typedProject.user_id === user.id;
  const isPublic =
    typedProject.visibility === "public" ||
    typedProject.visibility === "unlisted";

  if (!isOwner && !isPublic) {
    throw new UnauthorizedError(
      "You don't have permission to view this project"
    );
  }

  const { data: steps } = await supabase
    .from("steps")
    .select("*")
    .eq("project_id", typedProject.id)
    .order("index", { ascending: true });

  const typedSteps = (steps || []) as Step[];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{typedProject.name}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{typedProject.name}</CardTitle>
              <CardDescription>
                {typedProject.description || "No description"}
              </CardDescription>
            </div>
            <Badge variant="outline">{typedProject.visibility}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/view/${typedProject.slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Project
              </Link>
            </Button>
            {isOwner && (
              <Button asChild>
                <Link href={`/projects/${typedProject.slug}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Steps ({typedSteps.length || 0})
        </h2>
        {typedSteps.length > 0 ? (
          <div className="space-y-2">
            {typedSteps.map((step) => (
              <Card key={step.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Step {step.index + 1}: {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {step.notes || "No notes"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No steps yet. {isOwner && "Start editing to add steps."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
