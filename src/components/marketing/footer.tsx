import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer id="about" className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 px-6 py-14 sm:flex-row">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image src="/marketing/logo.png" alt="Parivaar" width={28} height={28} />
            <span className="text-lg font-semibold">Parivaar</span>
          </div>
          <p className="text-lg">भारत से 🇮🇳 भारत के लिए ❤️</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            A local community platform built to help communities connect,
            organize, and grow together.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold">Help</h3>
          <p className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            hello@parivaarapp.in
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            7042770304
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            Sector 03, Udaipur
          </p>
        </div>
      </div>
    </footer>
  );
}
