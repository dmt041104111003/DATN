import Image from 'next/image'

export default function NotFound404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Image
        src="/404.png"
        alt="404"
        height={500}
        width={750}
        className="mx-auto opacity-80"
      />
      <p className="-mt-2 text-xl text-muted-foreground">Not Found</p>
    </div>
  )
}
