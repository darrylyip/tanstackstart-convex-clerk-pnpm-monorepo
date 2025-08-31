import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    // if (!webhookSecret) {
    //   return new Response("Missing webhook secret", { status: 500 });
    // }

    // const svix_id = request.headers.get("svix-id");
    // const svix_timestamp = request.headers.get("svix-timestamp");
    // const svix_signature = request.headers.get("svix-signature");

    // if (!svix_id || !svix_timestamp || !svix_signature) {
    //   return new Response("Missing svix headers", { status: 400 });
    // }

    // const body = await request.text();
    // const wh = new Webhook(webhookSecret);

    // let evt: any;
    const evt = await validateRequest(request);
    if (!evt) {
      return new Response("Error occured", { status: 400 });
    }
    // try {
    //   evt = wh.verify(body, {
    //     "svix-id": svix_id,
    //     "svix-timestamp": svix_timestamp,
    //     "svix-signature": svix_signature,
    //   });
    // } catch (err) {
    //   return new Response("Invalid signature", { status: 400 });
    // }

    switch (evt.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.functions.users.syncUser, {
          clerkId: evt.data.id,
          email: evt.data.email_addresses[0].email_address,
          firstName: evt.data.first_name || "",
          lastName: evt.data.last_name || "",
          photoUrl: evt.data.image_url,
          phone: evt.data.phone_numbers?.[0]?.phone_number,
          lastLoginAt: evt.data.last_sign_in_at
            ? new Date(evt.data.last_sign_in_at).getTime()
            : undefined,
        });
        break;

      case "organization.created":
      case "organization.updated":
        await ctx.runMutation(internal.functions.users.syncOrganization, {
          clerkOrgId: evt.data.id,
          name: evt.data.name,
          slug: evt.data.slug,
          metadata: evt.data.public_metadata,
        });
        break;

      case "organizationMembership.created":
      case "organizationMembership.updated":
        // For organization membership events, we only sync the membership
        // The user should already exist from a user.created event
        // If they don't exist, we'll create a minimal user record
        await ctx.runMutation(
          internal.functions.users.syncOrganizationMembership,
          {
            clerkUserId: evt.data.public_user_data.user_id,
            clerkOrgId: evt.data.organization.id,
            role: evt.data.role,
          }
        );
        break;
    }

    return new Response("OK", { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  console.log("IN WEBHOOK, PAYLOAD: ", payloadString);
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;
