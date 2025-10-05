"use client";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import itemnotfound from "../../../../../public/itemnotfound.jpg";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const pathName = usePathname();

  const router = useRouter();
  return (
    <div className="container items-center justify-center flex flex-col min-h-screen gap-7">
      <Image
        className=" "
        src={itemnotfound}
        alt="not-found"
        height={200}
        width={200}
      />
      <h1 className="text-7xl font-extrabold bg-clip-text bg-contain  text-transparent   bg-[url('../../public/glitter3.jpg')]  ">
        404 - Not Found
      </h1>
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">
          Looks like product you are looking for doesnot exist.
        </h1>
        <Link replace={true} prefetch={true} href={{ pathname: pathName }}>
          <Button
          // onClick={() => {
          //   router.push(pathName);
          // }}
          >
            Go back{" "}
          </Button>
        </Link>
      </div>
    </div>
  );
}
