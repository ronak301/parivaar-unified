import Image from "next/image";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:grid-cols-2 sm:py-28">
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            India First{" "}
            <span className="text-primary">Local Community</span> Platform
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Parivaar lets you plan and manage all your social communities in
            one place.
          </p>
          <a
            href="#benefits"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get Started
          </a>
        </div>
        <div className="mx-auto w-full max-w-md">
          <Image
            src="/marketing/hero.png"
            alt=""
            width={800}
            height={800}
            className="w-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}
