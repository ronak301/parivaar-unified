import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Benefits } from "@/components/marketing/benefits";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Benefits />
      </main>
      <Footer />
    </div>
  );
}
