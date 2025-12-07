import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Code2,
  Plus,
  Edit,
  Share2,
  Eye,
  Download,
  Keyboard,
  Lightbulb,
  BookOpen,
  FileCode,
  Settings,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "User Guide - DiffSlides",
  description:
    "Learn how to use DiffSlides to create beautiful code tutorials with step-by-step diffs",
};

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">User Guide</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to create and share beautiful code tutorials with
            DiffSlides
          </p>
        </div>

        {/* What is DiffSlides */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              What is DiffSlides?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              DiffSlides is a tool that helps you create beautiful, step-by-step
              code tutorials. Instead of showing static code snippets,
              DiffSlides highlights exactly what changes between each step,
              making it easy for your audience to follow along and understand
              how code evolves.
            </p>
            <p className="text-muted-foreground">
              Perfect for teaching programming concepts, documenting refactoring
              processes, or explaining how to build features incrementally.
            </p>
          </CardContent>
        </Card>

        {/* Creating a Project */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Creating Your First Project
            </CardTitle>
            <CardDescription>
              Get started by creating a new project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Step 1: Create a Project</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You can create a project without signing up! Just click the{" "}
                <strong className="text-foreground">Create Project</strong>{" "}
                button in the navigation menu, or go to{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  /projects/new
                </code>
                .
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Give your project a name and an optional description. The name
                will be used to generate a unique URL slug for sharing.
              </p>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Projects
                  created without an account are temporary and may be deleted
                  after a period of inactivity. Sign up to keep your projects
                  permanently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adding Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Adding and Editing Steps
            </CardTitle>
            <CardDescription>
              Build your tutorial one step at a time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Creating Steps</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Steps are the building blocks of your tutorial. Each step
                represents a snapshot of your code at a particular point in the
                evolution.
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground ml-6">
                <li>
                  Click the{" "}
                  <strong className="text-foreground">+ Add Step</strong> button
                  in the sidebar
                </li>
                <li>Give your step a descriptive title</li>
                <li>
                  Select the programming language (TypeScript, JavaScript,
                  Python, HTML, CSS, or JSON)
                </li>
                <li>Write or paste your code in the editor</li>
                <li>
                  Optionally add notes to explain what&apos;s happening in this
                  step
                </li>
                <li>
                  Click{" "}
                  <strong className="text-foreground">Save Changes</strong> to
                  save your step
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Editing Steps</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Click on any step in the sidebar to edit it. You can modify:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground ml-6">
                <li>
                  <strong className="text-foreground">Title</strong> - The step
                  name
                </li>
                <li>
                  <strong className="text-foreground">Notes</strong> -
                  Explanatory text that appears alongside the code
                </li>
                <li>
                  <strong className="text-foreground">Language</strong> - The
                  syntax highlighting language
                </li>
                <li>
                  <strong className="text-foreground">Code</strong> - The actual
                  code content
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Managing Steps</h3>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground ml-6">
                <li>
                  <strong className="text-foreground">Reorder</strong> - Drag
                  and drop steps in the sidebar to change their order
                </li>
                <li>
                  <strong className="text-foreground">Duplicate</strong> - Click
                  the duplicate icon to copy a step, useful for making
                  incremental changes
                </li>
                <li>
                  <strong className="text-foreground">Delete</strong> - Remove
                  steps you no longer need
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Using the Editor */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Using the Code Editor
            </CardTitle>
            <CardDescription>
              Make the most of the editor features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Code Editor Tab</h3>
              <p className="text-sm text-muted-foreground mb-3">
                The Code Editor tab provides a full-featured code editor with
                syntax highlighting. Write your code here, and it will be
                automatically saved when you click Save Changes.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Diff View Tab</h3>
              <p className="text-sm text-muted-foreground mb-3">
                The Diff View shows you exactly what changed from the previous
                step:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground ml-6">
                <li>
                  <span className="inline-block w-3 h-3 rounded-full bg-primary mr-2"></span>
                  <strong className="text-foreground">Green highlights</strong>{" "}
                  show added lines
                </li>
                <li>
                  <span className="inline-block w-3 h-3 rounded-full bg-destructive mr-2"></span>
                  <strong className="text-foreground">Red highlights</strong>{" "}
                  show removed lines
                </li>
                <li>
                  <span className="inline-block w-3 h-3 rounded-full bg-warning mr-2"></span>
                  <strong className="text-foreground">Yellow highlights</strong>{" "}
                  show modified lines
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                This is exactly what your audience will see when viewing your
                tutorial!
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Step Info Bar</h3>
              <p className="text-sm text-muted-foreground mb-3">
                At the top of the editor, you&apos;ll see a summary showing:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground ml-6">
                <li>The current step number and title</li>
                <li>
                  How many lines were added or deleted compared to the previous
                  step
                </li>
                <li>An indicator if you have unsaved changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Sharing Projects */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Sharing Your Projects
            </CardTitle>
            <CardDescription>
              Control who can see your tutorials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Visibility Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You can control who can view your project using the visibility
                selector in the actions panel:
              </p>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">Private</Badge>
                    <span className="text-sm font-medium text-foreground">
                      Only you can see it
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Perfect for work-in-progress tutorials or personal notes.
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">Unlisted</Badge>
                    <span className="text-sm font-medium text-foreground">
                      Anyone with the link can see it
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share the link directly with specific people. It won&apos;t
                    appear in public listings.
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">Public</Badge>
                    <span className="text-sm font-medium text-foreground">
                      Everyone can see it
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your project can be discovered by anyone browsing public
                    projects.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Getting the Share Link</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Once your project is set to{" "}
                <strong className="text-foreground">Unlisted</strong> or{" "}
                <strong className="text-foreground">Public</strong>, you can:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground ml-6">
                <li>
                  Click the <ExternalLink className="inline h-3 w-3" /> icon in
                  the actions panel to open the viewer
                </li>
                <li>Copy the URL from your browser&apos;s address bar</li>
                <li>Share it with anyone you want to see your tutorial</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Viewing Projects */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Viewing Projects
            </CardTitle>
            <CardDescription>How the viewer experience works</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Navigation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                When viewing a project, you can navigate through steps using:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground ml-6">
                <li>
                  <strong className="text-foreground">
                    Previous/Next buttons
                  </strong>{" "}
                  - Move forward or backward one step at a time
                </li>
                <li>
                  <strong className="text-foreground">Step indicators</strong> -
                  Click the dots at the bottom to jump to any step
                </li>
                <li>
                  <strong className="text-foreground">
                    Keyboard shortcuts
                  </strong>{" "}
                  - Use arrow keys to navigate (see Keyboard Shortcuts section)
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Notes Panel</h3>
              <p className="text-sm text-muted-foreground mb-3">
                If a step has notes, they&apos;ll appear in a side panel
                (desktop) or drawer (mobile). Click the notes icon to toggle the
                panel open or closed.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Direct Links to Steps</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You can share a direct link to a specific step by adding{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  ?stepIndex=N
                </code>{" "}
                to the URL, where N is the step number (starting from 0).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Exporting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exporting Projects
            </CardTitle>
            <CardDescription>
              Download your tutorials as videos or animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Export Formats</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You can export your project as:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground ml-6">
                <li>
                  <strong className="text-foreground">GIF</strong> - Animated
                  GIF showing all steps
                </li>
                <li>
                  <strong className="text-foreground">MP4</strong> - Video file
                  suitable for sharing on social media or embedding
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Export Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">
                In the actions panel, you can adjust:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground ml-6">
                <li>
                  <strong className="text-foreground">Duration</strong> - How
                  long each step is displayed (in seconds)
                </li>
                <li>
                  <strong className="text-foreground">Format</strong> - Choose
                  between GIF or MP4
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Click the <strong className="text-foreground">Export</strong>{" "}
                button to generate and download your file.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </CardTitle>
            <CardDescription>
              Speed up your workflow with these shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm">In the Editor</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono w-24 text-center">
                      Ctrl+S
                    </code>
                    <span className="text-sm text-muted-foreground">
                      Save current step
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono w-24 text-center">
                      Cmd+S
                    </code>
                    <span className="text-sm text-muted-foreground">
                      Save current step (Mac)
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2 text-sm">In the Viewer</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono w-24 text-center">
                      ←
                    </code>
                    <span className="text-sm text-muted-foreground">
                      Previous step
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono w-24 text-center">
                      →
                    </code>
                    <span className="text-sm text-muted-foreground">
                      Next step
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips and Best Practices */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Tips & Best Practices
            </CardTitle>
            <CardDescription>
              Make your tutorials more effective
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-disc list-inside text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Keep steps focused</strong>{" "}
                - Each step should show one clear change or concept. Too many
                changes at once can be overwhelming.
              </li>
              <li>
                <strong className="text-foreground">
                  Use descriptive titles
                </strong>{" "}
                - Step titles help viewers understand what&apos;s happening.
                &quot;Add error handling&quot; is better than &quot;Step
                3&quot;.
              </li>
              <li>
                <strong className="text-foreground">
                  Add notes for context
                </strong>{" "}
                - Notes are perfect for explaining the &quot;why&quot; behind
                code changes, not just the &quot;what&quot;.
              </li>
              <li>
                <strong className="text-foreground">Start simple</strong> -
                Begin with the simplest version of your code, then gradually add
                complexity step by step.
              </li>
              <li>
                <strong className="text-foreground">
                  Use duplicate for incremental changes
                </strong>{" "}
                - Instead of rewriting code, duplicate a step and make small
                modifications. This makes the diff clearer.
              </li>
              <li>
                <strong className="text-foreground">
                  Test your viewer experience
                </strong>{" "}
                - Before sharing, view your project as a reader would to ensure
                the flow makes sense.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Supported Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Supported Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              DiffSlides supports syntax highlighting for the following
              languages:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "TypeScript",
                "JavaScript",
                "Python",
                "HTML",
                "CSS",
                "JSON",
              ].map((lang) => (
                <Badge key={lang} variant="secondary">
                  {lang}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
