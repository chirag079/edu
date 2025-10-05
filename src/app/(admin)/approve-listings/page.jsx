"use client";

import { useEffect, useState } from "react";
import {
  getPendingApprovals,
  approveAdvertisement,
  rejectAdvertisement,
} from "@/actions/admin.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApprovePage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadApprovals();
  }, []);

  async function loadApprovals() {
    try {
      const data = await getPendingApprovals();
      setApprovals(data);
    } catch (error) {
      toast.error("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (approvalId) => {
    try {
      const result = await approveAdvertisement(approvalId);
      if (result.success) {
        toast.success(result.message);
        loadApprovals(); // Refresh the list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to approve advertisement");
    }
  };

  const handleReject = async (approvalId) => {
    try {
      const result = await rejectAdvertisement(approvalId);
      if (result.success) {
        toast.success(result.message);
        loadApprovals(); // Refresh the list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to reject advertisement");
    }
  };

  const filteredApprovals =
    activeTab === "all"
      ? approvals
      : approvals.filter(
          (approval) => approval.itemType.toLowerCase() === activeTab
        );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Pending Approvals</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="stationary">Stationary</TabsTrigger>
          <TabsTrigger value="flat">Flats</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid gap-4">
            {filteredApprovals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  No pending approvals found.
                </CardContent>
              </Card>
            ) : (
              filteredApprovals.map((approval) => (
                <Card key={approval._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <span className="text-lg">
                          {approval.item.title || approval.item.name}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({approval.itemType})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(approval._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(approval._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Advertiser: {approval.advertiser.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        College: {approval.college}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cost: ₹{approval.calculatedCost}
                      </p>
                      <p className="text-sm">{approval.item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
