"use client";

import { Spinner } from "copilot-design-system";

export default function () {
  return (
    <div className="flex align-middle justify-center min-h-[100vh]">
      <div className="self-center">
        <Spinner size={10} />
      </div>
    </div>
  );
}
