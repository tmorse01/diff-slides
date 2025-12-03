import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/landing/hero";
import { EditorShowcase } from "@/components/landing/editor-showcase";
import { Features } from "@/components/landing/features";
import { Preview } from "@/components/landing/preview";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Preview />
      <EditorShowcase />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}
