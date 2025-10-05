import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <LoadingSkeleton />;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen container flex flex-col  items-center   space-y-10 sm:pt-20 pt-40 mb-10">
      <div className="grid md:grid-cols-12 grid-cols-1 gap-2 w-full  ">
        <Skeleton className="h-80   rounded-md md:col-span-3 col-span-1 md:col-start-1" />
        <div className="flex flex-col -ml-4     min-h-80  md:col-span-9 col-span-1 col-start-4 pl-16 pt-1 gap-4 ">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-44" />
        </div>
      </div>
      <div className=" w-full">
        <Skeleton className="h-56 rounded-md" />
      </div>
    </div>
  );
}
