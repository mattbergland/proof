import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set({
    name: "proof_session",
    value: "",
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  return response;
}
