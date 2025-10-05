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
import { RemoveAdminDialog } from "./RemoveAdminDialog";
import { Button } from "@/components/ui/button";
import { fetchAdmins } from "@/actions/admin.actions";
import { auth } from "@/auth";

export default async function AdminTable() {
  const admins = await fetchAdmins();
  const session = await auth();
  const currentUser = session?.user;
  return (
    <Table className="border">
      <TableCaption>A list of Admins.</TableCaption>
      <TableHeader className="pt-16">
        <TableRow>
          <TableHead>USERNAME</TableHead>
          <TableHead>EMAIL</TableHead>
          <TableHead>ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins &&
          admins.map((admin) => (
            <TableRow key={admin?._id}>
              <TableCell>{admin?.username}</TableCell>
              {/* <TableCell>{admin?.createdAt}</TableCell> */}
              <TableCell>{admin?.email}</TableCell>
              <TableCell>
                {currentUser?.username !== admin.username && (
                  <RemoveAdminDialog
                    warning={
                      "This will remove the user from being an Admin and all Admin rights will be taken away."
                    }
                    title={"Remove Admin"}
                    username={admin?.username}
                  />
                )}
                {currentUser?.username === admin.username && (
                  <Button variant="link">Current User</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">{admins?.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
