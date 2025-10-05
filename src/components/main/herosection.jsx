import Link from "next/link";
import { Button } from "../ui/button";
import { LampContainer } from "../ui/lamp";
import { auth } from "@/auth";

export default async function Herosection() {
  const session = await auth();
  const isLoggedin = session?.user?.username;
  return (
    // <LampContainer className=" ">
    <div className="container  flex flex-col  items-center min-h-[60vh] justify-center gap-7   text-4xl py-3 my-3">
      <h1 className="capitalize text-6xl sm:text-7xl font-extrabold sm:text-center  ">
        EduStation{" "}
        <span className="  text-2xl italic">- Your Campus Companion</span>
      </h1>
      <p className="sm:text-2xl text-xl font-bold opacity-80  max-w-4xl mt-5">
        Navigating through college life just got easier! At EduStation, we
        understand the unique challenges faced by students. That&apos;s why
        we&apos;ve created a platform that caters specifically to your needs.
        {/* <br />
        <br /> */}
        Join us at EduStation, where every student&apos;s need is met with a
        solution. Sign up today and make the most of your college experience!
      </p>
      <div className="flex gap-10 items-center justify-center">
        {!isLoggedin && (
          <>
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="scale-125 bg-secondary capitalize font-bold"
              >
                Sign Up{" "}
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant=""
                className="scale-125 capitalize font-bold"
              >
                {" "}
                Login{" "}
              </Button>
            </Link>
          </>
        )}
        {isLoggedin && (
          <Link replace={true} href="/dashboard">
            <Button>Go To Dashboard</Button>
          </Link>
        )}
      </div>
    </div>
    // </LampContainer>
  );
}
