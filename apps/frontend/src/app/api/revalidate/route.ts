import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
      true,
    );

    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }

    console.log("Revalidating tag:", body);

    if (!body?._type) {
      return new Response("Bad request", { status: 400 });
    }

    revalidateTag(body._type, "max");

    return NextResponse.json({ revalidated: true, tag: body._type });
  } catch (err) {
    console.error(err);
    return new Response((err as Error).message, { status: 500 });
  }
}
