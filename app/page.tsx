import { Assistant } from "./assistant";
import { AccessGate } from "@/components/access-gate";

export default function Home() {
  return (
    <AccessGate>
      <Assistant />
    </AccessGate>
  );
}
