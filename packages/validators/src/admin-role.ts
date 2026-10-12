import { z } from "zod";

/** Client may only submit partner self-selection (CWA-53). */
export const selectAdminRoleClientSchema = z.enum(["PARTNER"]);

/** Server validates the wire value before `assertSalesRoleSelectable`. */
export const selectAdminRoleServerSchema = z.enum(["PARTNER", "SALES"]);

export type SelectAdminRoleClient = z.infer<typeof selectAdminRoleClientSchema>;
export type SelectAdminRoleServer = z.infer<typeof selectAdminRoleServerSchema>;
