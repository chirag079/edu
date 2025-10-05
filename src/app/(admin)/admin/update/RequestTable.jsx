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
import { fetchPendingProductApprovals } from "@/actions/admin.actions";
import { auth } from "@/auth";
import { modifyDate } from "@/lib/helper/dataModifier";
import Link from "next/link";

export default async function RequestTable() {
  const admins = null;
  const approvals = await fetchPendingProductApprovals(0);
  // console.log(a);
  const session = await auth();
  const currentUser = session?.user;
  return (
    <Table className="border">
      <TableCaption>Pending Requests.</TableCaption>
      <TableHeader className="pt-16">
        {approvals && (
          <TableRow>
            <TableHead>USERNAME</TableHead>
            <TableHead>PRODUCT</TableHead>
            <TableHead>CATEGORY</TableHead>
            <TableHead>CREATED </TableHead>
            <TableHead></TableHead>
          </TableRow>
        )}
      </TableHeader>
      <TableBody>
        {approvals &&
          approvals.map((approval) => (
            <TableRow key={approval?._id}>
              <TableCell>{approval?.lender?.username}</TableCell>
              {/* <TableCell>{admin?.createdAt}</TableCell> */}
              <TableCell>{approval?.Model?.name}</TableCell>
              <TableCell>
                {approval?.onModel === "flats"
                  ? "Flat / P.G."
                  : "Books / Stationary"}
              </TableCell>
              <TableCell>{modifyDate(approval?.createdAt)}</TableCell>
              <TableCell>
                {
                  <Link
                    href={`/admin/update/approvalRequest/?id=${approval?._id}`}
                  >
                    <Button className="text-xs h-7">Review</Button>
                  </Link>
                }
              </TableCell>
            </TableRow>
          ))}
        {approvals.length < 1 && (
          <>
            <TableRow>
              <TableCell>No Pending Requests</TableCell>
            </TableRow>
          </>
        )}
      </TableBody>
      {approvals && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right">{approvals?.length}</TableCell>
          </TableRow>
        </TableFooter>
      )}
      {!approvals && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right">0</TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}
