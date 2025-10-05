import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import WishlistItem from "./WishlistItem";

const WishlistPage = ({
  items,
  onRemove,
  onMoveToCart,
  onMoveAllToCart,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Wishlist</CardTitle>
          <CardDescription>
            Your wishlist is empty. Start adding items you love!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            No items in your wishlist yet. Browse our products and add items you
            love to your wishlist.
          </p>
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Start Shopping
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Wishlist</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} in your
            wishlist
          </p>
        </div>
        <Button onClick={onMoveAllToCart}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Move All to Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <WishlistItem
            key={item._id}
            item={item}
            onRemove={onRemove}
            onMoveToCart={onMoveToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
