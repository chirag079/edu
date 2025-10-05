import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import profilereplacement from "../../../../public/profilereplacement.jpg";
import Image from "next/image";
import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { fetchCaraouselProducts } from "@/actions/items.actions";
import { Suspense } from "react";
import SSRloader from "@/components/SSRLoader";

export default async function ProductCaraousell({
  model,
  title,
  role,
  isRegistered,
}) {
  const data = await fetchCaraouselProducts(model);

  return (
    <Suspense fallback={<SSRloader />}>
      {isRegistered && (
        <Card className="border-muted shadow-none border-none">
          <CardHeader className="sm:flex  sm:flex-row sm:px-7 flex flex-col items-center gap-2  sm:gap-5">
            <CardTitle className="flex  text-4xl items-center sm:gap-6 ml-2">
              {title}
            </CardTitle>
            <div className="flex  gap-2">
              {role === "Lender" && (
                <span className="ml-2 ">
                  <Link href="/register-item">
                    <Button
                      variant="secondary"
                      className=" font-bold max-w-sm:mr-2"
                    >
                      Add Item
                    </Button>
                  </Link>
                </span>
              )}
              {data?.length > 0 && (
                <Link
                  href={`/product/${
                    model === "Stationary" ? "stationary" : "flat"
                  }`}
                >
                  <Button className="font-bold " variant="secondary">
                    See More
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>

          <Carousel className="      rounded-xl sm:w-11/12 sm:mx-auto       ">
            <CarouselContent className="-ml-4 mr-1 ">
              {data?.length == 0 ? (
                <CarouselItem className="  ml-2       pl-4">
                  <div className=" max-sm:mx-auto border-muted border shadow-sm rounded-2xl text-center flex justify-center items-center        my-4  md:h-28 h-32 max-sm:px-2    ">
                    <h1>
                      {" "}
                      Sorry! No product is currently available for you, We will
                      add more soon
                    </h1>
                  </div>
                </CarouselItem>
              ) : (
                <>
                  {data.map((item) => (
                    <CarouselItem
                      key={item?._id}
                      className="  max-sm:w-8/12     max-sm:mx-3 mx-2     lg:basis-[20%]  "
                    >
                      <Link
                        href={`/search/?type=${model}&name=${item?.name}&id=${item?._id}`}
                      >
                        <Card className="  bg-popover border-muted border-2 shadow-none flex-none max-sm:mx-auto max-sm:w-9/12   md:w-60 w-52   my-4  shadow-muted-foreground h-72 hover:shadow-md hover:shadow-muted-foreground   hover:cursor-pointer transition-all duration-200 delay-0  ease-in-out  ">
                          <div className="flex flex-col items-center h-full w-full justify-between rounded-md overflow-visible ">
                            <Image
                              src={
                                item?.image
                                  ? item.image
                                  : "https://th.bing.com/th/id/OIP.RYDmKYNwd0vEueh_4VLRdAAAAA?rs=1&pid=ImgDetMain"
                              }
                              className="h-[81%] max-sm:h-[88%] rounded-t-lg object-cover"
                              // objectFit="contain"
                              height={224}
                              width={250}
                              alt="product"
                            />
                            <div className=" flex h-[19%] max-sm:h-[12%] px-2 justify-center   rounded-md w-full pb-1   flex-col overflow-clip ">
                              <div className="flex justify-between items-center pr-2">
                                <CardTitle className=" w-10/12 capitalize flex items-center justify-between ">
                                  {item?.name}
                                </CardTitle>
                                <div className="font-bold text-sm">
                                  ${item?.price}
                                </div>
                              </div>
                              <h1 className="w-10/12 max-sm:hidden mt-2 ml-1 overflow-clip font-light text-xs opacity-70 flex">
                                #tags,#tags
                              </h1>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </CarouselItem>
                  ))}
                </>
              )}

              {data?.length > 6 && (
                <CarouselItem className="  max-sm:w-8/12     max-sm:ml-3 mx-2     lg:basis-[20%]  ">
                  <Link
                    href={`/product/${
                      model === "Stationary" ? "stationary" : "flat"
                    }`}
                  >
                    <Card className=" flex flex-col justify-center gap-3  items-center  max-sm:w-9/12 hover:shadow-md hover:shadow-primary hover:cursor-pointer   md:w-60 w-52  shadow-sm  my-4  shadow-muted-foreground h-72 bg-accent     ">
                      <ExternalLink className="  rounded-full" size={35} />
                      <h1>Browse All</h1>
                    </Card>{" "}
                  </Link>
                </CarouselItem>
              )}
            </CarouselContent>
            {data?.length > 1 && <CarouselPrevious />}
            {data?.length > 1 && <CarouselNext />}
          </Carousel>
        </Card>
      )}
      {!isRegistered && (
        <Card className="border-muted shadow-none border-none">
          <CardHeader className="sm:flex  sm:flex-row sm:px-7 flex flex-col items-center gap-2  sm:gap-5">
            <CardTitle className="flex  text-4xl items-center sm:gap-6 ml-2">
              {title}
            </CardTitle>
          </CardHeader>
          <Carousel className="      rounded-xl sm:w-11/12 sm:mx-auto       ">
            <div className=" ">
              <div className=" max-sm:mx-auto border-muted border shadow-sm rounded-2xl text-center flex justify-center items-center        my-4  h-28    ">
                <h1 className="">
                  {" "}
                  Complete your profile registration to explore :{" "}
                  <Link
                    href="/profile"
                    className="font-semibold ml-1 text-sm hover:underline transition-all duration-150 text-blue-600"
                  >
                    Click Here
                  </Link>
                </h1>
              </div>
            </div>
          </Carousel>
        </Card>
      )}
    </Suspense>
  );
}
