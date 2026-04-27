"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-heading text-primary">
          Something went wrong
        </h1>
        <p className="text-muted max-w-md mx-auto">{error.message}</p>
        <button
          onClick={reset}
          className="inline-block mt-4 px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
