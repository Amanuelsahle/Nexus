import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Nexus
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your collaborative workspace for building amazing things together
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">Real-time Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Work together seamlessly with live editing and presence indicators
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">Infinite Nesting</h3>
            <p className="text-sm text-muted-foreground">
              Organize your work with unlimited nested documents and folders
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">Rich Text Editor</h3>
            <p className="text-sm text-muted-foreground">
              Powerful editor with slash commands and media support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
