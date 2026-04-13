import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-heading text-primary">404</h1>
        <p className="text-2xl font-heading">Page not found</p>
        <p className="text-muted max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
