import Image from "next/image"

const features = [
  {
    title: "Origin Traceability",
    description: "Trace complete product journey from source to consumer. Verify origin, production date, and authenticity at every step.",
    image: "/images/features/1.png",
  },
  {
    title: "Authenticity Verification",
    description: "Each product is minted as an NFT on Cardano blockchain, creating immutable and tamper-proof proof of authenticity.",
    image: "/images/features/2.png",
  },
  {
    title: "QR Code Scanning",
    description: "Consumers can instantly verify product origin by scanning QR codes. Build trust through transparent traceability.",
    image: "/images/features/3.png",
  },
]

export function Features() {
  return (
    <section className="py-12 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Powerful Traceability Features
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Complete product origin traceability combined with the security and transparency of blockchain technology.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 sm:h-[300px]">
        <div className="group relative rounded-xl border bg-card overflow-hidden">
          <div className="relative h-full min-h-[200px]">
            <Image src={features[0].image} alt={features[0].title} fill className="object-cover object-center opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          </div>
          <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="font-semibold mb-1">{features[0].title}</h3>
            <p className="text-sm text-muted-foreground">{features[0].description}</p>
          </div>
        </div>

        <div className="group relative rounded-xl border bg-card overflow-hidden">
          <div className="relative h-full min-h-[200px]">
            <Image src={features[1].image} alt={features[1].title} fill className="object-cover object-center opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          </div>
          <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="font-semibold mb-1">{features[1].title}</h3>
            <p className="text-sm text-muted-foreground">{features[1].description}</p>
          </div>
        </div>

        <div className="group relative rounded-xl border bg-card overflow-hidden">
          <div className="relative h-full min-h-[200px]">
            <Image src={features[2].image} alt={features[2].title} fill className="object-cover object-center opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          </div>
          <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="font-semibold mb-1">{features[2].title}</h3>
            <p className="text-sm text-muted-foreground">{features[2].description}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
