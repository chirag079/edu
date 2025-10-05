import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // For search/promote
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For role change
import { ClipboardList, Users, UserPlus, Search } from "lucide-react";
import {
  getPendingListings,
  approveListing,
  rejectListing,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getPendingEvents,
  getPendingRestaurants,
} from "@/actions/admin.actions";
// Client component for handling actions
import AdminActionButtons from "./AdminActionButtons";
import SSRLoader from "@/components/SSRLoader"; // Ensure this path is correct

// --- Pending Listings Tab ---
async function PendingApprovalsTab() {
  // Fetch pending items from all relevant collections
  const [pendingListings, pendingEvents, pendingRestaurants] =
    await Promise.all([
      getPendingListings(20),
      getPendingEvents(20),
      getPendingRestaurants(20),
    ]);

  // Combine and sort all pending items by creation date (newest first)
  const allPendingItems = [
    ...pendingListings,
    ...pendingEvents,
    ...pendingRestaurants,
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Item Approvals</CardTitle>
        <CardDescription>
          Review listings, events, and restaurants submitted for approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {allPendingItems.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No pending items found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title / Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPendingItems.map((item) => (
                <TableRow key={item.id}>
                  {" "}
                  {/* Use unique item.id */}
                  <TableCell className="font-medium">
                    {item.title || item.name} {/* Display title or name */}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.itemType}</Badge>
                  </TableCell>
                  <TableCell>
                    {/* Adjust based on population (createdBy vs advertiserId) */}
                    {item.createdBy?.username ||
                      item.advertiserId?.username ||
                      "N/A"}
                  </TableCell>
                  <TableCell>{item.college}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Pass itemType and ID. Actions need updating later. */}
                    <AdminActionButtons
                      itemId={item.id}
                      itemType={item.itemType}
                      // TODO: Update these props/component logic later
                      onApprove={approveListing} // Placeholder
                      onReject={rejectListing} // Placeholder
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {/* TODO: Add Pagination controls if needed */}
      </CardContent>
    </Card>
  );
}

// --- User Management Tab ---
async function UserManagementTab() {
  // Fetch users using the server action
  const users = await getAllUsers(20); // Fetch more for initial view

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View, manage roles, or remove users.</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No users found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.college || "N/A"}</TableCell>
                  <TableCell>
                    {/* Pass current role and update action */}
                    <AdminActionButtons
                      userId={user.id}
                      currentRole={user.role}
                      onUpdateRole={updateUserRole}
                      onDelete={deleteUser}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isVerified ? "default" : "destructive"}
                    >
                      {user.isVerified ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Action buttons moved inside AdminActionButtons */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {/* TODO: Add Pagination controls if needed */}
      </CardContent>
    </Card>
  );
}

// --- Main Admin Duties Page ---
export default async function AdminDutiesPage({ searchParams }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return redirect("/login?error=Unauthorized");
  }

  // Determine default tab from searchParams or set a default
  const defaultTab = searchParams?.tab || "approvals";

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          Admin Duties
        </h1>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {" "}
            {/* Changed to 2 cols */}
            <TabsTrigger value="approvals">
              <ClipboardList className="mr-2 h-4 w-4" /> Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" /> User Management
            </TabsTrigger>
            {/* Removed Promote User tab - merged into User Management */}
          </TabsList>

          {/* Approvals Tab Content */}
          <TabsContent value="approvals">
            <Suspense fallback={<SSRLoader />}>
              <PendingApprovalsTab />
            </Suspense>
          </TabsContent>

          {/* User Management Tab Content */}
          <TabsContent value="users">
            <Suspense fallback={<SSRLoader />}>
              <UserManagementTab />
            </Suspense>
          </TabsContent>

          {/* Removed Promote User Tab Content */}
        </Tabs>
      </div>
    </div>
  );
}
