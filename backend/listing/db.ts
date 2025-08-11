import { SQLDatabase } from "encore.dev/storage/sqldb";

export const listingDB = new SQLDatabase("listing", {
  migrations: "./migrations",
});
