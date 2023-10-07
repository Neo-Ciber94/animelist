import { getUser } from "@animelist/auth-next/server";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    const user = await getUser(req.cookies);

    if (user) {
      console.log({ user });
    }
  }

  return NextResponse.next();
}
