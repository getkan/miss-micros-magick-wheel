import BookBackground from '@/components/BookBackground';
import Image from 'next/image';
import Link from 'next/link'

export default function Home() {
  return (
  <>
    <BookBackground></BookBackground>
    <main
      className="border-offwhite bg-background relative flex flex-col gap-2 rounded-lg border-2 p-8 md:min-w-200 "
    >
      <h1
        className="bg-background absolute -top-4 left-2 flex transform flex-nowrap items-center gap-2 px-4 text-[1.5rem] font-bold sm:-top-8 sm:text-[2rem] rounded-4xl"
      >
        <span className="whitespace-nowrap"><span className="hidden sm:inline-block">Miss Micro&#x27;s</span> Magick Wheel</span>
        <Image src="wheel.svg" alt="Wheel" height="36" width="36" className="animate-spin" loading="eager"></Image>
      </h1>
      <p className="text-xl">
        Gather round the Magick Wheel!  
      </p>
      <p className="text-xl">
        Miss Micro&#x27;s Bookclub has made their recommendations and now the Wheel shall choose our next book...
      </p>

      <Link
        href="/wheel"				
        className="ml-auto mt-4 flex w-fit items-baseline gap-2 rounded-lg p-2"
				>Go To Wheel<span className="text-[2rem] leading-4">→</span>
      </Link>
    </main>
  </>
  );
}
