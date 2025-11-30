import Image from "next/image";

export function EditorShowcase() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12 space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            Powerful editor for creating tutorials
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Build step-by-step tutorials with an intuitive interface. Edit code,
            add notes, and preview changes in real-time.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl p-2">
            <div className="relative w-full aspect-video">
              <Image
                src="/editor-screenshot.png"
                alt="DiffSlides editor interface showing code editor with timeline sidebar"
                fill
                className="object-contain rounded-md"
                quality={100}
                unoptimized
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
