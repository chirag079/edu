import React from "react";
import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

const RatingDisplay = ({ ratings, averageRating, totalRatings }) => {
  const getRatingPercentage = (star) => {
    if (!totalRatings) return 0;
    const count = ratings.filter((r) => r.rating === star).length;
    return (count / totalRatings) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= averageRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <CardDescription>
              {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
            </CardDescription>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-8 text-sm">{star}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${getRatingPercentage(star)}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-right">
                  {getRatingPercentage(star).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div key={rating._id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={rating.user?.image}
                    alt={rating.user?.name}
                  />
                  <AvatarFallback>{rating.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{rating.user?.name}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= rating.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(rating.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              {rating.review && (
                <p className="text-sm text-muted-foreground">{rating.review}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingDisplay;
