"use server";

import { auth } from "../auth";
import { connecToDb } from "../lib/connectToDb";
import { Approval } from "../lib/models/approval.schema";
import { Flat } from "../lib/models/flat.schema";
import { Stationary } from "../lib/models/stationary.schema";

export async function fetchBooks(page, limit, type, searchName) {
  connecToDb();
  try {
    const session = await auth();
    const availableCollege = session?.user?.college;
    const model = type === "stationary" ? Stationary : Flat;
    const query = {
      approvalStatus: "Approved",
      availableCollege: availableCollege,
    };
    // console.log(searchName);
    if (searchName) {
      const nameRegex = new RegExp(searchName.split("").join(".*"), "i");
      query.name = { $regex: nameRegex };
    }
    const books = await model
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit);
    return books;

    // console.log(answer);
  } catch (error) {
    console.log(error);
  }
}
export async function getTotalBooks(type) {
  connecToDb();
  try {
    const session = await auth();
    const availableCollege = session?.user?.college;
    const model = type === "stationary" ? Stationary : Flat;
    const totalbooks = await model.countDocuments({
      approvalStatus: "Approved",
      availableCollege: availableCollege,
    });
    return totalbooks;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchCaraouselProducts(model) {
  connecToDb();
  const Model = model === "Flat" ? Flat : Stationary;
  let result = [];
  try {
    const session = await auth();
    const availableCollege = session?.user?.college;
    result = await Model.find({
      available: true,
      availableCollege: availableCollege,
      approvalStatus: "Approved",
    })
      .limit(7)
      .skip(0)
      .select({ _id: 1, name: 1, price: 1, createdAt: 1, image: 1 })
      .sort({ createdAt: -1 });
    return result;
  } catch (error) {
    console.log(error);
    return result;
  }
}
export async function fetchProductPage(model, id) {
  connecToDb();
  try {
    const Model = model === "Flat" ? Flat : Stationary;
    const result = await Model.findById(id);

    return result;
  } catch (error) {
    // console.log(error);
    return null;
  }
}
export async function fetchProductPageWithSeller(id) {
  connecToDb();
  try {
    const data = await Approval.findById(id).select(["Model", "onModel"]);

    const itemId = data?.Model;
    const Model = data?.onModel === "flats" ? Flat : Stationary;

    const result = await Model.findById(itemId).populate("lender", {
      password: 0,
      _id: 0,
      role: 0,
      updatedAt: 0,
    });

    return result;
  } catch (error) {
    // console.log(error);
    return null;
  }
}
export async function updateItem(type, id, update) {
  try {
    connecToDb();
    const Model = type === "flats" ? Flat : Stationary;
    await Model.findByIdAndUpdate(id, update);
  } catch (error) {
    console.log(error);
    return;
  }
}
