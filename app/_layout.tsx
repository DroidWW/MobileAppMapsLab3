import { DatabaseProvider } from "@/context/DatabaseContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return( 
    <DatabaseProvider>
      <Stack />
    </DatabaseProvider>
  );
}
