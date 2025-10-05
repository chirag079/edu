import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, IndianRupee, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WishlistItem = ({ item, onRemove, onMoveToCart }) => {
  return (
    <Card className="group relative overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(item._id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Link href={`/product/${item._id}`}>
        <CardHeader className="p-0">
          <div className="relative aspect-square">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
            {item.status === "Sold" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Sold</Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {item.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-1">
            {item.description}
          </CardDescription>
          <div className="flex items-center gap-1 mt-2">
            <IndianRupee className="h-4 w-4" />
            <span className="font-semibold">{item.price}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{item.condition}</Badge>
            <Badge variant="outline">{item.category}</Badge>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => onMoveToCart(item._id)}
          disabled={item.status === "Sold"}
        >
          <Heart className="h-4 w-4 mr-2" />
          Move to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishlistItem;
