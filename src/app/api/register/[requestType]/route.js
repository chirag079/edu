import { Login } from "./login";
import { Signup } from "./signup";

export async function POST(request, { params }) {
  //   const { searchParam } = req;
  const requestedRoute = params.requestType;
  if (requestedRoute === "signup") {
    return Signup(request);
  } else if (requestedRoute === "login") {
    return Login(request);
  } else {
    return Response.json({ a: requestedRoute });
  }
}
