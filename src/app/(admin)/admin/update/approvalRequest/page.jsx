import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/auth";

import Image from "next/image";
import { ClientItemRequest } from "./clientcomponents";
import { fetchProductPageWithSeller } from "@/actions/items.actions";
import { notFound, redirect } from "next/navigation";
import { modifyDate } from "@/lib/helper/dataModifier";

export default async function ProductPage(props) {
  const session = await auth();
  if (!session) {
    return redirect("/login");
  }
  const { searchParams } = props;
  const id = searchParams?.id;
  // console.log(id);
  const data = await fetchProductPageWithSeller(id);
  // const data2 = await fetchProcuctDetailWithSeller("665dbc8601111aae67201e55");
  // console.log(data);
  if (!data) {
    notFound();
  }
  return (
    <div className="min-h-screen  flex flex-col gap-11   items-center    sm:pt-10 pt-20 mb-10">
      <Card className="container   border-0 shadow-none py-4 ">
        <div className="grid md:grid-cols-12 grid-cols-1 gap-2   ">
          {/* <div className="flex items-center justify-center min-h-96 gap-3"> */}
          <Image
            className="bg-white h-80  shadow-primary shadow-md    rounded-md md:col-span-3 col-span-1 md:col-start-1 "
            src={
              data?.image
                ? data.image
                : "https://th.bing.com/th/id/OIP.RYDmKYNwd0vEueh_4VLRdAAAAA?rs=1&pid=ImgDetMain"
            }
            alt="image"
            height={400}
            width={440}
          />

          <div className="flex flex-col sm:-ml-4 max-sm:pt-10    min-h-80  md:col-span-9 col-span-1  sm:pl-16 pt-1 gap-4 max-sm:gap-7 ">
            <div className="font-bold text-5xl capitalize">{data?.name}</div>
            <div className="font-medium text-muted-foreground opacity-90 max-sm:-mt-5">
              #story,#adventure,#tale,#jeanlumier
            </div>
            {data?.location && (
              <div className="container mx-0 px-0 min-h-10 max-h-32 break-words capitalize">
                {" "}
                <span className="font-bold text-xl ">Location :</span>{" "}
                {data?.location}
              </div>
            )}
            {data?.recommendedFor && (
              <div className="container mx-0 px-0  min-h-10 max-h-32 break-words capitalize">
                {" "}
                <span className="font-bold text-xl ">
                  Recommended For :
                </span>{" "}
                {data?.recommendedFor}
              </div>
            )}
            <div className="py-7 flex flex-col  gap-2">
              <h1 className="text-2xl font-bold ">
                ${data?.price}{" "}
                <span className="font-light text-sm"> per item</span>{" "}
              </h1>

              <div className="text-xl mt-4  font-bold flex items-center gap-4">
                Action:{" "}
                <span>
                  <ClientItemRequest itemId={id} type={searchParams?.type} />
                </span>
              </div>
            </div>
            {/* <div className="text-xl font-medium">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Voluptates, quo delectus! Ipsam obcaecati necessitatibus officia
                optio laudantium iure reiciendis sed similique sunt. Illum, odit.
                Saepe commodi blanditiis, repellat facere doloremque quis
                inventore accusamus assumenda qui? Tempore ratione impedit fugiat
                exercitationem.
              </div> */}
          </div>
        </div>
        <div className="pt-7 flex flex-col gap-2   min-h-56 break-words">
          <h1 className="font-bold text-3xl tracking-wide ">Description :</h1>
          <div className="font-light  px-1       w-full break-words capitalize  ">
            {/* “The Little Story Book” by Jean Lumier is a captivating collection
            of adventurous tales designed to ignite the imagination of young
            readers. Each story is a journey into a world of excitement and
            wonder, where children can explore, learn, and grow. The book is
            filled with vibrant characters, thrilling plots, and valuable life
            lessons. From daring quests in enchanted forests to exciting voyages
            across the seven seas, Lumier’s stories are not just entertaining,
            but also foster creativity, courage, and curiosity. Lumier’s unique
            storytelling style is engaging and easy to understand, making it
            perfect for children. The stories are short enough to keep a child’s
            attention, yet rich enough to be enjoyed over and over again. */}
            {data?.description}
          </div>
        </div>
      </Card>
      <div className="grid sm:grid-cols-8 grid-cols-1 max-sm:gap-3 container  w-full ">
        <Card className=" sm:col-span-2 col-span-1 col-start-1      ">
          <CardHeader>
            <CardTitle>About the seller</CardTitle>
          </CardHeader>
          <CardContent className="">
            <div className="font-bold capitalize">
              Username:
              <span className=" ml-2 text-sm font-normal">
                {data?.lender?.username}
              </span>
            </div>
            <div className="font-bold capitalize">
              Email:
              <span className=" ml-2 text-sm font-normal">
                {data?.lender?.email}
              </span>
            </div>
            <div className="font-bold capitalize">
              Mobile:
              <span className=" ml-2 text-sm font-normal">
                {data?.lender?.mobile}
              </span>
            </div>
            <div className="font-bold capitalize">
              College:
              <span className=" ml-2 text-sm font-normal">
                {data?.lender?.college}
              </span>
            </div>
            <div className="font-bold capitalize">
              Address:
              <span className=" ml-2 text-sm font-normal">
                {data?.lender?.address}
              </span>
            </div>
            <div className="font-bold capitalize">
              Since:
              <span className=" ml-2 text-sm font-normal">
                {modifyDate(data?.lender?.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className=" sm:col-span-2 col-span-1   sm:col-start-6    ">
          <CardHeader>
            <CardTitle>Created On</CardTitle>
          </CardHeader>
          <CardContent>{modifyDate(data?.createdAt)}</CardContent>
        </Card>
      </div>
    </div>
  );
}
