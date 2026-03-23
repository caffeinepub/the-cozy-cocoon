import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName: string;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  productName,
  onConfirm,
  isPending,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl" data-ocid="delete.dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{productName}</strong>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="delete.cancel_button"
            className="rounded-xl"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="delete.confirm_button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
