import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container items-center justify-center flex flex-col min-h-screen gap-7">
      <h1 className="text-7xl font-extrabold bg-clip-text bg-contain  text-transparent   bg-[url('../../public/glitter3.jpg')]  ">
        404 - Not Found
      </h1>
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">
          Looks like page you are looking for doesnot exist.
        </h1>
        <Link replace={true} href="/">
          <Button>Go back Home</Button>
        </Link>
      </div>
    </div>
  );
}
