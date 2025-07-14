import type { SVGProps } from 'react';
import Image from 'next/image';

export function KidneyIcon(props: SVGProps<SVGSVGElement> & {className?: string}) {
  // Fallback to SVG if the image fails to load, though this component is being phased out.
  // The main usage is now Image component directly.
  return (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.39 5.85C10.88 5.36 11.43 5 12 5c.57 0 1.12.36 1.61.85.98 1 1.61 2.4 1.61 3.93 0 1.53-.63 2.93-1.61 3.93-.98 1-2.22 1.48-3.44 1.23-1.22-.25-2.31-1.04-2.9-2.07-.59-1.03-.9-2.25-.9-3.53 0-1.28.31-2.5.9-3.53.29-.51.64-.97 1.03-1.38Z" />
      <path d="M10.39 5.85s-1.9 1.9-2.14 3.79C8 11.53 8.24 13.56 9 15c.76 1.44 1.84 2.69 3 3.5 1.16.81 2.48 1.23 3.83 1.17 1.35-.06 2.62-.64 3.54-1.56.92-.92 1.46-2.17 1.46-3.48 0-1.31-.54-2.56-1.46-3.48-.92-.92-2.19-1.5-3.54-1.56-1.35-.06-2.67.36-3.83 1.17-1.16.81-2.24 2.06-3 3.5-.76 1.44-1 3.47-1.25 5.36-.25 1.89-2.14 3.79-2.14 3.79" />
    </svg>
  );
}
