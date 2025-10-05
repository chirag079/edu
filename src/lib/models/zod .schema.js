import z from "zod";

const usernameRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$/;
const emailRegex =
  /^(?=.*[a-zA-Z])[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z]+\.[a-zA-Z]+$/;

export const zodUserSchema = z.object({
  name: z.string().min(2).max(30),
  email: z
    .string()
    .refine((value) => emailRegex.test(value), {
      message: "Email must  be in a valid format",
    })
    .refine((value) => value.length >= 5 && value.length <= 35, {
      message: "Email must be between 5 and 35 characters",
    }),
  username: z
    .string()
    .refine((value) => usernameRegex.test(value), {
      message: "Username must be alphanumeric",
    })
    .refine((value) => value.length >= 5 && value.length <= 20, {
      message: "Username must be between 5 and 20 characters",
    }),
  password: z
    .string()
    .refine((value) => value.length >= 8 && value.length <= 20, {
      message: "Password must be between 8 and 20 characters",
    }),
  role: z.enum(["admin", "advertiser", "explorer"]).default("explorer"),
});

export const zodLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export const zodUserDetailsSchema = z.object({
  mobile: z.number(),
  address: z.string(),
  college: z.string(),
});

export const zodStationaryInputSchema = z.object({
  name: z
    .string()
    .min(3, "Name should be at least 3 characters long")
    .max(30, "Name should be at most 30 characters long")
    .regex(/^[a-zA-Z][a-zA-Z0-9 _]*[a-zA-Z0-9]$/i, "Invalid name"),

  description: z
    .string()
    .min(200, "Description should be at least 200 characters long")
    .max(400, "Description should be at most 400 characters long")
    .regex(
      /^(?=.*[a-zA-Z])([a-zA-Z0-9\s\.\,\;\:\!\?@#\$%\^&\*\(\)\-\+]+)$/i,
      "Invalid description"
    ),
  recommendedFor: z
    .string()
    .min(100, "RecommendedFor should be at least 100 characters long")
    .max(200, "RecommendedFor should be at most 200 characters long")
    .regex(
      /^(?=.*[a-zA-Z])([a-zA-Z0-9\s\.\,\;\:\!\?@#\$%\^&\*\(\)\-\+]+)$/i,
      "Invalid recommendedFor"
    ),
  tags: z
    .string()
    .min(1, "Tags should be 1 charater minimum")
    .max(70, "Tags should be 70 characters long")
    .refine(
      (value) => {
        const tags = value.split(",");
        return tags.every((tag) => /^#[a-zA-Z0-9]+$/.test(tag));
      },
      {
        message:
          "Invalid tags format. Tags should be in the form of '#tag1,#tag2,#tag3'.",
      }
    ),
  // tags: z.array(z.string().regex(/^[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*$/, "Invalid tag")),
  price: z.number().min(0, "Price should be at least 0"),
});

export const zodFlatInputSchema = z.object({
  name: z
    .string()
    .min(3, "Name should be at least 3 characters long")
    .max(30, "Name should be at most 30 characters long")
    .regex(/^[a-zA-Z][a-zA-Z0-9 _]*[a-zA-Z0-9]$/i, "Invalid name"),
  location: z
    .string()
    .min(20, "Location should be at least 3 characters long")
    .max(200, "Location should be at most 30 characters long")
    .regex(
      /^(?=.*[a-zA-Z])([a-zA-Z0-9\s\.\,\;\:\!\?@#\$%\^&\*\(\)\-\+]+)$/i,
      "Invalid location"
    ),
  description: z
    .string()
    .min(200, "Description should be at least 200 characters long")
    .max(400, "Description should be at most 400 characters long")
    .regex(
      /^(?=.*[a-zA-Z])([a-zA-Z0-9\s\.\,\;\:\!\?@#\$%\^&\*\(\)\-\+]+)$/i,
      "Invalid description"
    ),
  price: z.number().min(0, "Price should be at least 0"),
  // tags: z.array(
  //   z.string().regex(/^[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*$/, "Invalid tag")
  // ),
  tags: z

    .string()
    .min(1, "Tags should be 1 charater minimum")
    .max(70, "Tags should be 70 characters long")
    .refine(
      (value) => {
        const tags = value.split(",");
        return tags.every((tag) => /^#[a-zA-Z0-9]+$/.test(tag));
      },
      {
        message:
          "Invalid tags format. Tags should be in the form of '#tag1,#tag2,#tag3'.",
      }
    ),
  capacity: z
    .number()
    .min(1, "Capacity should be at least 1")
    .max(10, "Capacity should be at most 10"),
});
