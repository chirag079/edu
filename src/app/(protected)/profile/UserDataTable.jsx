import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { fetchUserDataByUsername } from "@/actions/user.actions";
import { FileWarning } from "lucide-react";

// Helper function to format date
const formatDate = (date) => {
  if (!date) return "Not Available";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to format value based on type
const formatValue = (value) => {
  if (value === null || value === undefined) return "Not Available";
  if (value === "") return "Not Available";
  if (value === 0) return "0";
  if (value instanceof Date) return formatDate(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length;
  if (typeof value === "object") {
    if (value.balance !== undefined) {
      return `₹${value.balance}`;
    }
    return JSON.stringify(value);
  }
  return value;
};

export default async function USerDataTable({ username }) {
  const userdetails = await fetchUserDataByUsername(username);
  const keys = Object.keys(userdetails?._doc || {});

  // Fields to skip
  const skipFields = [
    "__v",
    "_id",
    "password",
    "verificationToken",
    "verificationTokenExpiry",
    "resetPasswordToken",
    "resetPasswordExpiry",
  ];

  return (
    <Table className="border">
      <TableCaption></TableCaption>
      <TableHeader className="pt-16">
        <TableRow>
          <TableHead className="w-1/2 border border-r font-bold">
            Field
          </TableHead>
          <TableHead className="w-1/2 font-bold">Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userdetails &&
          keys.map((key) => {
            // Skip internal fields
            if (skipFields.includes(key)) {
              return null;
            }

            // Handle wallet display
            if (key === "wallet") {
              return (
                <TableRow key={key}>
                  <TableCell className="border border-r capitalize font-medium">
                    {key}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div>Balance: ₹{userdetails[key].balance}</div>
                      <div className="text-sm text-muted-foreground">
                        {userdetails[key].transactions.length} transactions
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            // Handle ratings display
            if (key === "ratings") {
              return (
                <TableRow key={key}>
                  <TableCell className="border border-r capitalize font-medium">
                    {key}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div>
                        Average Rating: {userdetails.averageRating || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {userdetails[key].length} reviews
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            // Handle wishlist display
            if (key === "wishlist") {
              return (
                <TableRow key={key}>
                  <TableCell className="border border-r capitalize font-medium">
                    {key}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {userdetails[key].length} items
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            // Handle timestamps
            if (key === "createdAt" || key === "updatedAt") {
              return (
                <TableRow key={key}>
                  <TableCell className="border border-r capitalize font-medium">
                    {key}
                  </TableCell>
                  <TableCell>{formatDate(userdetails[key])}</TableCell>
                </TableRow>
              );
            }

            // Handle other fields
            return (
              <TableRow key={key}>
                <TableCell className="border border-r capitalize font-medium">
                  {key}
                </TableCell>
                <TableCell>{formatValue(userdetails[key])}</TableCell>
              </TableRow>
            );
          })}
      </TableBody>
      <TableFooter></TableFooter>
    </Table>
  );
}
