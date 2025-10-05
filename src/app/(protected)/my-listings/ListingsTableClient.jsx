"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Helper function to format status
const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        >
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        >
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        >
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
};

export default function ListingsTableClient({ items }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Submissions</CardTitle>
        <CardDescription>
          View the status of all your submitted listings, events, and
          restaurants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            You haven&apos;t created any listings yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title / Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.itemType}-${item.id}`}>
                  <TableCell className="font-medium">
                    {item.title || item.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.itemType}</Badge>
                  </TableCell>
                  <TableCell>{formatStatus(item.status)}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
