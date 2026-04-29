import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registrationsApi, ApiError } from '@/services/api';

export interface EditVendorDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Local applicant row id (e.g. reg-123) for state updates */
  applicantId: string;
  registrationId: number;
  /** Maps to Rails registration `name` (contact name) */
  initialContactName: string;
  initialPhone: string;
  /** Shown read-only — not in Rails `update_params` */
  emailReadOnly: string;
  onSaved: (applicantId: string, patch: { contact_name: string; phone: string }) => void;
}

export function EditVendorDetailsModal({
  open,
  onOpenChange,
  applicantId,
  registrationId,
  initialContactName,
  initialPhone,
  emailReadOnly,
  onSaved,
}: EditVendorDetailsModalProps) {
  const [name, setName] = useState(initialContactName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialContactName);
      setPhone(initialPhone || '');
      setFormError(null);
    }
  }, [open, initialContactName, initialPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await registrationsApi.update(registrationId, {
        name: name.trim(),
        phone: phone.trim(),
      });
      onSaved(applicantId, { contact_name: name.trim(), phone: phone.trim() });
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        setFormError(err.errors.join(' '));
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Could not save changes.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-muted text-foreground sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit vendor details</DialogTitle>
            <p className="text-xs text-foreground/60 pt-1">
              Contact name and phone can be updated. Status, category, and payment use their existing controls.
            </p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-email" className="text-xs text-foreground/80">
                Email
              </Label>
              <Input
                id="edit-vendor-email"
                value={emailReadOnly}
                disabled
                className="bg-background/10 border-border text-xs opacity-80"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-name" className="text-xs text-foreground/80">
                Contact name
              </Label>
              <Input
                id="edit-vendor-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/5 border-border text-xs"
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-phone" className="text-xs text-foreground/80">
                Phone
              </Label>
              <Input
                id="edit-vendor-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background/5 border-border text-xs"
                autoComplete="tel"
                placeholder="Optional"
              />
            </div>
            {formError && (
              <p className="text-xs text-red-400 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1.5">
                {formError}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" className="voxxy-btn-solid" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
