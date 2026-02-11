import type { Database } from "@nozbe/watermelondb";
import { createContext, useContext } from "react";
import { database } from "@/db";

const DatabaseContext = createContext<Database>(database);

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  return <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>;
};

export const useDatabase = (): Database => {
  return useContext(DatabaseContext);
};
