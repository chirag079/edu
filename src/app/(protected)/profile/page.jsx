import { fetchUserDataByUsername } from "@/actions/user.actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, User } from "lucide-react";
import UpdateProfileForm from "./UpdateProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Profile() {
  const session = await auth();
  if (!session?.user) {
    return redirect("/login?error=SessionExpired");
  }
  const userdetails = await fetchUserDataByUsername(session.user.username);

  if (!userdetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 pt-20 mb-10">
        <p className="text-red-500">Could not load profile data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center space-y-8 sm:pt-20 pt-40 mb-10">
      <div className="container md:w-7/12 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-4xl">User Profile</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">
              <User size={20} className="mr-2" />
              Profile Details
            </TabsTrigger>
            <TabsTrigger value="editProfile">
              <Pencil size={20} className="mr-2" />
              Edit Profile
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{userdetails.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium">
                        {userdetails.username || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {userdetails.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">
                        {userdetails.role || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Contact & Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {userdetails.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-medium">
                        {userdetails.country || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="font-medium">
                        {userdetails.state || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{userdetails.city || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {userdetails.address || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {userdetails.bio || "No bio provided."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="editProfile">
            <UpdateProfileForm userdetails={userdetails} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
