import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { ArrowLeft, Edit, Eye, Calendar, FileCode } from "lucide-react";
import { ProjectVisibilitySelector } from "@/components/project-visibility-selector";
import { format } from "date-fns";
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
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold tracking-tight">
                  {typedProject.name}
                </h1>
                {isOwner ? (
                  <ProjectVisibilitySelector project={typedProject} />
                ) : (
                  <Badge variant="outline" className="capitalize text-sm">
                    {typedProject.visibility}
                  </Badge>
                )}
              </div>
              {typedProject.description && (
                <p className="text-lg text-muted-foreground mb-4">
                  {typedProject.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Updated{" "}
                    {format(new Date(typedProject.updated_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  <span>
                    {typedSteps.length}{" "}
                    {typedSteps.length === 1 ? "step" : "steps"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="lg">
                <Link href={`/view/${typedProject.slug}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Project
                </Link>
              </Button>
              {isOwner && (
                <Button asChild size="lg">
                  <Link href={`/projects/${typedProject.slug}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Steps Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Steps</h2>
            <Badge variant="secondary" className="text-sm">
              {typedSteps.length} {typedSteps.length === 1 ? "step" : "steps"}
            </Badge>
          </div>

          {typedSteps.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {typedSteps.map((step) => (
                <Card
                  key={step.id}
                  className="hover:shadow-md transition-shadow border-border/50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="shrink-0">
                        Step {step.index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {step.language}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 line-clamp-2">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {step.notes ? (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {step.notes}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No notes
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {step.code.split("\n").length} lines of code
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No steps yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {isOwner
                    ? "Start editing your project to add steps and create your tutorial."
                    : "This project doesn't have any steps yet."}
                </p>
                {isOwner && (
                  <Button asChild>
                    <Link href={`/projects/${typedProject.slug}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Add Your First Step
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
