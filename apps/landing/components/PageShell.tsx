import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ink min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[58px]">{children}</main>
      <Footer />
    </div>
  );
}
