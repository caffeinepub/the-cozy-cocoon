import { Button } from "@/components/ui/button";
import { Leaf, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-5 shadow-card">
            <Leaf className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-foreground tracking-tight">
            The Cozy Cocoon
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Inventory Management
          </p>
        </div>

        {/* Login card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in securely to access your inventory dashboard.
          </p>
          <Button
            data-ocid="login.primary_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 text-base font-medium"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} The Cozy Cocoon. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
