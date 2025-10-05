import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return <LoadingSkeleton />;
}
function LoadingSkeleton() {
  return (
    <div className="min-h-screen  flex flex-col items-center   space-y-24 sm:pt-20 pt-40 mb-5 ">
      <div className="container grid grid-cols-12 gap-5  ">
        <Skeleton className="sm:h-72 h-52 md:col-span-3 col-span-6   mx-1  " />
        <Skeleton className="sm:h-72 h-52 md:col-span-3 col-span-6  mx-1  " />
        <Skeleton className="sm:h-72 h-52 md:col-span-3 col-span-6  mx-1  " />
        <Skeleton className="sm:h-72 h-52  md:col-span-3 col-span-6 mx-1  " />
        <Skeleton className="sm:h-72 h-52  md:col-span-3 col-span-6 mx-1  " />
        <Skeleton className="sm:h-72 h-52  md:col-span-3 col-span-6 mx-1  " />
        <Skeleton className="sm:h-72 h-52  md:col-span-3 col-span-6 mx-1  " />
        <Skeleton className="sm:h-72 h-52  md:col-span-3 col-span-6 mx-1  " />
      </div>
    </div>
  );
}
