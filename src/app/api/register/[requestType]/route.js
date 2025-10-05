import { Login } from "./login";
import { Signup } from "./signup";

export async function POST(request, context) {
  // ✅ Must await context to get params properly
  const { params } = await context;
  const requestedRoute = params.requestType;

  if (requestedRoute === "signup") {
    return Signup(request);
  } else if (requestedRoute === "login") {
    return Login(request);
  } else {
    return new Response(
      JSON.stringify({ error: `Invalid request type: ${requestedRoute}` }),
      { status: 400 }
    );
  }
}
