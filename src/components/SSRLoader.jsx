import { Loader2 } from "lucide-react";

export default function SSRloader() {
  return (
    <div disabled className="flex flex-row items-center justify-center">
      <Loader2 className="mr-2 h-4 w-4   animate-spin " />
      <span>Please wait</span>
    </div>
  );
}
