import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface Props {
  open: boolean;
}

export function ProfileSetupModal({ open }: Props) {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await mutateAsync({ name: name.trim() });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="rounded-2xl" data-ocid="profile.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Welcome to The Cozy Cocoon
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="profile-name">Your name</Label>
            <Input
              id="profile-name"
              data-ocid="profile.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah"
              className="mt-1.5"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || isPending}
            className="w-full bg-primary text-primary-foreground rounded-xl"
            data-ocid="profile.submit_button"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Get Started
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
