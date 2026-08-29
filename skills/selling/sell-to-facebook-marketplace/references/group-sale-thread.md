# Facebook Group Moving-Room Sale Thread

Use this route when Pon asks to share existing, verified Marketplace inventory
in one named Facebook Group as a single sale thread.

When the canonical inventory uses `items/<item-id>/listing.json`, pass its
`items` directory and local `photos` root to the packet helper. It selects only
`status: live` manifests and resolves their listed product-photo paths; live
Facebook verification still happens after approval.

## Required inventory evidence

For every proposed item, verify the current Marketplace page before creating a
packet. Include only an item that is live, has one canonical listing URL and
ID, an exact visible title and THB price, and one to ten truthful product
photos. Exclude sold, unavailable, restricted, Marketplace-only, ambiguous, or
previously verified group-post items.

## Group preflight

Open the named group without joining it. It is eligible only when a normal
`Write something…` / `Create post` composer is visible. Stop for an approval
queue warning, a requirement to join, a `Sell Something` composer, a
Marketplace listing composer, a changed group, or an account warning.

## Exact packet

Create a same-day packet containing:

- the group ID, name, canonical URL, and visible normal-composer evidence;
- one announcement: Thai text `ขายของย้ายหอ`, background `red`, no item facts;
- ordered item comments with listing ID, canonical URL, exact title, THB price,
  photo paths/count, and complete comment text;
- public effect, expiry, and post/comment verification checks.

Use the approval syntax:

```text
approve-group-sale-thread <packet_id> <group_id> <listing_id,listing_id,...>
```

Approval covers only the named group, announcement, and listed comment items.

## Execute and verify

1. Reverify the group and every live listing after approval.
2. Create the normal group post with `ขายของย้ายหอ` and Facebook's red text
   background. Inspect it before clicking `Post` once.
3. Reload the group, open the announcement permalink, and verify the exact
   headline and red background.
4. Add each approved item as one comment: the verified item photo and exact
   price. Verify each comment permalink, photo count, and price after reload.
5. Record the announcement and comment permalinks in local runtime state. An
   uncertain or unindexed item is not eligible for automatic reposting.

Never edit a price, add availability claims, or use another group because the
first group fails. Continue only with independently verified items from the
approved packet.
