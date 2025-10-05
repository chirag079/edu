"use server";
import { Flat } from "@/lib/models/flat.schema";
import { Stationary } from "@/lib/models/stationary.schema";
import { connecToDb } from "@/lib/connectToDb";
import { Request } from "@/lib/models/Request.schema";

import { auth } from "@/auth";

import { successResponse } from "@/lib/utils/success.response";
import { revalidatePath } from "next/cache";

export async function createPurchaseRequest(id, type) {
  try {
    connecToDb();
    // console.log(mongoose.mongo.BSON.BSONValue(id));
    const session = await auth();
    if (!session) {
      return redirect("/login");
    }

    const borrower = session?.user?.id;
    const model = type === "Flats" ? Flat : Stationary;
    // const r = await Stationary.findOne({ price: 3020 }).populate("lender");

    // console.log(r);
    const isValidProduct = await model
      .findById(id)
      .populate("lender", { _id: 1 });
    //   mongoose.mongo.BSON.BSONValue(id) hereee
    console.log(isValidProduct);
    if (!isValidProduct) {
      return;
    }
    const lender = isValidProduct?.lender?._id;

    const onModel = type === "Flats" ? "flats" : "stationaries";
    // console.log(onModel, lender, id, borrower);
    // console.log(mongoose.Types.ObjectId.isValid(borrower + " "));
    const createRequest = await Request.create({
      onModel: onModel,
      lender: lender,
      Model: id,
      borrower: borrower,
    });
    return;
  } catch (error) {
    console.log(error);
    return;
  } finally {
    revalidatePath("/dashboard");
  }
}
export async function checkDuplicateRequest(userId, itemId) {
  try {
    await connecToDb();
    const session = await auth();

    if (!session) {
      return redirect("/login");
    }
    const doRequestExist = await Request.findOne({
      borrower: userId,
      Model: itemId,
    });
    // console.log(doRequestExist);
    if (!doRequestExist) {
      return { Message: true, Data: "no duplicate request exist" };
    } else {
      return {
        Message: false,
        Data: `Your request is ${doRequestExist?.approvalStatus}`,
      };
    }
  } catch (error) {
    console.log(error);
    return;
  }
}
export async function fetchBorrowRequests(userId) {
  let requests = [];
  try {
    await connecToDb();
    requests = await Request.find({
      borrower: userId,
      approvalStatus: "Pending",
    }).populate("Model", {
      tags: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    // requests = await Request.aggregate([
    //   {
    //     $unwind: "$Model",
    //   },
    //   {
    //     $lookup: {
    //       from: "onModel",
    //       localField: "Model",
    //       foreignField: "_id",
    //       as: "products ",
    //     },
    //   },
    //   {
    //     $unwind: "$products",
    //   },
    //   {
    //     $project: {
    //       approvalStatus: -1,
    //       tags: -1,
    //       createdAt: -1,
    //       updatedAt: -1,
    //     },
    //   },
    //   {
    //     $sort: {
    //       latestTweetDate: -1,
    //     },
    //   },
    // ]);
    return requests;
  } catch (error) {
    console.log(error);
    return requests;
  }
}
export async function fetchCompleteBorrowRequests(userId, skip) {
  let requests = [];
  try {
    await connecToDb();
    requests = await Request.find({
      borrower: userId,
    })

      .sort({ createdAt: -1 })
      .limit(10)
      .populate("Model", {
        name: 1,
        description: 1,
        price: 1,
        image: 1,
        availableCollege: 1,
      })
      .populate("lender", {
        username: 1,

        email: 1,
      });

    return requests;
  } catch (error) {
    console.log(error);
    return requests;
  }
}
