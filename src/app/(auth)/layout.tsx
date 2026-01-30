export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Shala</h1>
          <p className="text-sm text-muted-foreground">
            Yoga Teaching Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
