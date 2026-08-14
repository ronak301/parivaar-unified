import Image from "next/image";

const BENEFITS = [
  {
    image: "/marketing/Home1.png",
    title: "Multiple Communities, Single App",
    description:
      "Parivaar lets you plan and manage all your social communities at one place.",
  },
  {
    image: "/marketing/Home2.png",
    title: "Digital Directory",
    description:
      "Parivaar lets you plan and manage all your social communities at one place.",
  },
  {
    image: "/marketing/Home3.png",
    title: "Extensive Search & Filters",
    description:
      "Parivaar lets you plan and manage all your social communities at one place.",
  },
  {
    image: "/marketing/Home4.png",
    title: "Greetings",
    description:
      "Parivaar lets you plan and manage all your social communities at one place.",
  },
  {
    image: "/marketing/Home5.png",
    title: "Business Networking",
    description:
      "Parivaar lets you plan and manage all your social communities at one place.",
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Benefits of Parivaar
        </h2>
        <p className="mt-3 text-muted-foreground">
          Parivaar lets you plan and manage all your social communities at
          one place.
        </p>
      </div>
      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.title}
            className="flex flex-col items-center gap-4 rounded-2xl border bg-background p-6 text-center shadow-sm"
          >
            <div className="relative h-40 w-full overflow-hidden rounded-xl bg-blue-50">
              <Image
                src={benefit.image}
                alt=""
                fill
                className="object-contain p-4"
              />
            </div>
            <h3 className="text-lg font-semibold text-primary">
              {benefit.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
