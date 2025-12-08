import { NextRequest } from "next/server";
import { verifyProjectAccess } from "@/lib/project-access";
import { ValidationError } from "@/lib/errors";
import { StepsService } from "@/lib/services/steps.service";
import { exportProjectAsMp4 } from "@/lib/export";
import { verifyApiKey, getApiKeyFromRequest } from "@/lib/api-key";
import { ProjectsService } from "@/lib/services/projects.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> | { projectId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { projectId } = resolvedParams;

    // Check for API key (for testing - bypasses normal auth)
    const apiKey = getApiKeyFromRequest(request);
    let project;

    if (apiKey && verifyApiKey(apiKey)) {
      // API key authentication - bypass normal auth check
      // Use admin client to fetch project directly
      project = await ProjectsService.getById(projectId);
      if (!project) {
        throw new ValidationError("Project not found");
      }
    } else {
      // Normal authentication flow
      project = await verifyProjectAccess(projectId);
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const duration = parseFloat(searchParams.get("duration") || "3");
    const width = searchParams.get("width")
      ? parseInt(searchParams.get("width")!, 10)
      : undefined;
    const height = searchParams.get("height")
      ? parseInt(searchParams.get("height")!, 10)
      : undefined;
    const quality = searchParams.get("quality")
      ? parseInt(searchParams.get("quality")!, 10)
      : undefined;

    // Validate parameters
    if (duration <= 0 || duration > 10) {
      throw new ValidationError("Duration must be between 0 and 10 seconds");
    }

    if (width && (width < 100 || width > 4000)) {
      throw new ValidationError("Width must be between 100 and 4000 pixels");
    }

    if (height && (height < 100 || height > 4000)) {
      throw new ValidationError("Height must be between 100 and 4000 pixels");
    }

    if (quality && (quality < 1 || quality > 100)) {
      throw new ValidationError("Quality must be between 1 and 100");
    }

    // Fetch steps
    const steps = await StepsService.getByProjectId(projectId);

    if (steps.length === 0) {
      throw new ValidationError("Project has no steps to export");
    }

    // Get base URL for rendering
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Get cookies to pass to Puppeteer for authentication
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter((cookie) => cookie.length > 0)
      .map((cookie) => {
        const [name, ...valueParts] = cookie.split("=");
        return { name: name.trim(), value: valueParts.join("=") };
      })
      .filter((cookie) => cookie.name && cookie.value);

    // Export as MP4 with timeout
    const exportPromise = exportProjectAsMp4(project.slug, steps, baseUrl, {
      frameDelay: duration,
      width,
      height,
      quality,
      cookies, // Pass cookies for Puppeteer authentication
    });

    // Set overall timeout of 5 minutes for the entire export
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Export timeout: The export took too long to complete. Try reducing the number of steps or duration."
            )
          ),
        300000 // 5 minutes
      )
    );

    const mp4Buffer = await Promise.race([exportPromise, timeoutPromise]);

    // Return MP4 file
    return new Response(mp4Buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${project.slug}-export.mp4"`,
        "Content-Length": mp4Buffer.length.toString(),
      },
    });
  } catch (error) {
    // Log technical error details on server
    console.error("[MP4 Export API] Technical error:", error);
    if (error instanceof Error) {
      console.error("[MP4 Export API] Error message:", error.message);
      console.error("[MP4 Export API] Error stack:", error.stack);
    }

    // Return user-friendly error message
    let userMessage = "Failed to export MP4. Please try again.";
    let statusCode = 500;
    let technicalDetails: string | undefined = undefined;

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // In development, include technical details
      if (process.env.NODE_ENV !== "production") {
        technicalDetails = error.message;
      }

      // Handle specific error cases with user-friendly messages
      if (errorMessage.includes("timeout")) {
        userMessage =
          "Export timed out. The project may be too large. Try reducing the number of steps or the frame duration.";
        statusCode = 408;
      } else if (errorMessage.includes("no steps")) {
        userMessage = "Cannot export: The project has no steps to export.";
        statusCode = 400;
      } else if (errorMessage.includes("too many steps")) {
        userMessage =
          "Cannot export: The project has too many steps. Maximum 50 steps allowed.";
        statusCode = 400;
      } else if (errorMessage.includes("failed to capture")) {
        userMessage =
          "Failed to capture screenshots. Please ensure the project is accessible and try again.";
        statusCode = 500;
      } else if (
        errorMessage.includes("ffmpeg") ||
        errorMessage.includes("mp4")
      ) {
        userMessage =
          "Failed to process the video. Please ensure ffmpeg is installed and try again.";
        statusCode = 500;
        // In development, include the actual error
        if (process.env.NODE_ENV !== "production") {
          technicalDetails = error.message;
        }
      } else if (
        errorMessage.includes("permission") ||
        errorMessage.includes("access")
      ) {
        userMessage = "You don't have permission to export this project.";
        statusCode = 403;
      } else if (errorMessage.includes("validation")) {
        userMessage = error.message; // Validation errors are usually user-friendly
        statusCode = 400;
      }
    }

    return Response.json(
      {
        error: userMessage,
        code: "EXPORT_FAILED",
        ...(technicalDetails && { details: technicalDetails }),
      },
      { status: statusCode }
    );
  }
}
