import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BadgeEuro } from "lucide-react";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";
import Image from "next/image";
import aim from "../../../public/frontmain.jpg";

export default function Mainbody() {
  return (
    <div className="flex flex-col container space-y-40">
      <Card className="w-10/12 min-h-96 bg-secondary   mx-auto flex items-center  ">
        <div className="mx-auto h-4/5 rounded-xl    w-11/12 grid md:grid-cols-4 grid-cols-1 gap-3 max-sm:pt-3">
          <Image
            className="bg-primary h-72 rounded-xl md:col-span-1 object-cover mx-auto  "
            height={350}
            width={200}
            src={aim}
            alt="image"
          />
          <div className="md:col-span-3 text-wrap ml-2   h-full ">
            {" "}
            At <span className="font-bold">EduStation</span>, our aim is to
            revolutionize the college experience by providing a one-stop
            solution for students’ needs. We strive to create a platform that
            not only facilitates the buying and selling of second-hand
            stationary but also simplifies the process of finding vacant flats
            and hostels.
            <br />
            <br />
            Our vision is to create a{" "}
            <span className="font-bold">
              community where every student feels supported and empowered.
            </span>{" "}
            We envision a world where students can focus on their studies and
            personal growth, without being burdened by the logistical challenges
            of college life.
            <br />
            <br />
            At EduStation,{" "}
            <span className="font-bold">
              we believe in the power of technology
            </span>{" "}
            to make life easier.Our goals are clear and focused. We aim to
            develop a user-friendly interface that enhances the overall user
            experience. We are committed to making a difference in the lives of
            students, one transaction at a time.
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-5 w-full ">
        <Card className="h-80 w-80 mx-auto flex flex-col justify-between">
          <div className="flex items-center justify-between ">
            <CardHeader>
              <CardTitle>Effortless Transactions</CardTitle>
            </CardHeader>
            <BadgeEuro color="green" className="mr-5" fill="green" size={50} />
          </div>
          <CardContent>
            <p>
              EduStation offers a seamless and user-friendly interface that
              allows students to effortlessly buy and sell second-hand
              stationary. With just a few clicks, students can browse through a
              wide range of items, place orders, make payments, and even list
              their own items for sale.
            </p>
          </CardContent>
        </Card>
        <Card className="h-80 w-80 mx-auto flex flex-col justify-between">
          <div className="flex items-center justify-between ">
            <CardHeader>
              <CardTitle>Real-Time Accommodation</CardTitle>
            </CardHeader>
            <BadgeEuro color="green" className="mr-5" fill="green" size={50} />
          </div>
          <CardContent>
            <p>
              One of the standout features of EduStation is its real-time
              accommodation finder. This feature provides students with
              up-to-date information on vacant flats and hostels, making the
              process of finding suitable accommodation quicker and easier.
            </p>
          </CardContent>
        </Card>
        <Card className="h-80 w-80 mx-auto flex flex-col justify-between">
          <div className="flex items-center justify-between  ">
            <CardHeader>
              <CardTitle>Personalized Experience</CardTitle>
            </CardHeader>
            <BadgeEuro color="green" className="mr-5" fill="green" size={50} />
          </div>
          <CardContent>
            <p>
              EduStation is designed with the student in mind. Our platform
              learns from your preferences and behaviors to provide a
              personalized user experience. Whether you’re a buyer looking for
              specific items or a seller targeting a certain group of students,
              our platform adapts to your needs.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="h-[20rem] rounded-md flex flex-col antialiased bg-background text-foreground  justify-evenly relative overflow-hidden">
        <h1 className="text-4xl capitalize font-bold flex ml-10 mb-10 ">
          Success Stories
        </h1>
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
          className="-mt-10"
        />
      </div>
    </div>
  );
}

const testimonials = [
  {
    quote:
      "EduStation has been a game-changer for me. I managed to sell all my old textbooks within a week. The process was so simple and efficient. Highly recommended!",
    name: "Praveen",
    title: "Seller at EduStation",
  },
  {
    quote:
      "I was struggling to find affordable stationary until I came across EduStation. I found everything I needed at great prices. The user interface is also very friendly. A big thumbs up!",
    name: "Chirag",
    title: "Buyer at EduStation",
  },
  {
    quote:
      "I had a pile of unused stationary lying around. Thanks to EduStation, not only did I declutter, but I also made some money. The platform is secure and the team is very supportive.",
    name: "Devansh",
    title: "Seller at EduStation",
  },
  {
    quote:
      "Finding a vacant hostel was a nightmare until I found EduStation. I found a great place within my budget. EduStation made my hostel hunting experience stress-free.",
    name: "Archit",
    title: "Buyer at EduStation",
  },
  {
    quote:
      "I listed my old calculator on EduStation and it was sold within two days. The platform is easy to use and the service is excellent. I'll definitely use it again.",
    name: "Kunal",
    title: "Seller at EduStation",
  },
];
