import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { Viewer } from "@/components/viewer/viewer";
import { Navbar } from "@/components/navbar";
import type { Project, Step } from "@/types/database";

export default async function ViewProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectSlug: string }> | { projectSlug: string };
  searchParams: Promise<{ stepIndex?: string }> | { stepIndex?: string };
}) {
  const user = await getUser();
  const supabase = await createClient();
  const resolvedParams = params instanceof Promise ? await params : params;
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams;
  const { projectSlug } = resolvedParams;
  const { stepIndex } = resolvedSearchParams;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", projectSlug)
    .single();

  if (error || !project) {
    throw new NotFoundError("Project not found");
  }

  const typedProject = project as Project;

  // Check visibility
  const isOwner = user && typedProject.user_id === user.id;
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

  const initialStepIndex = stepIndex ? parseInt(stepIndex, 10) : 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <Viewer steps={typedSteps} initialStepIndex={initialStepIndex} />
    </div>
  );
}
