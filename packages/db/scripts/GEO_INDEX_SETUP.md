## Geospatial index (MongoDB 2dsphere)

Partners are represented as `User` records with `role = "PARTNER"`.
The GeoJSON field is stored as `users.location`:

```js
{
  type: "Point",
  coordinates: [lng, lat]
}
```

### Create index via MongoDB Compass

1. Open your cluster in Compass
2. Go to database `crux_db` → collection `users`
3. Open the **Indexes** tab → **Create Index**
4. Use this JSON:

**Keys**

```json
{ "location": "2dsphere" }
```

**Options**

```json
{
  "name": "users_location_2dsphere_partner_only",
  "partialFilterExpression": { "role": "PARTNER" }
}
```

### Create index via mongosh

```js
use crux_db;
db.users.createIndex(
  { location: "2dsphere" },
  { name: "users_location_2dsphere_partner_only", partialFilterExpression: { role: "PARTNER" } }
);
```

Note: Prisma does not reliably create/manage MongoDB `2dsphere` indexes, so this index is intentionally managed outside Prisma.

