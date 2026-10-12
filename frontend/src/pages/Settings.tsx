import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { api, ApiError } from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Disclaimer } from "../components/Disclaimer";
import { useTextToSpeech } from "../hooks/useSpeech";
import { cn } from "../utils/cn";

function useLocalToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? defaultValue : stored === "true";
  });
  function toggle() {
    setValue((v) => {
      localStorage.setItem(key, String(!v));
      return !v;
    });
  }
  return [value, toggle] as const;
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-medium text-[var(--color-navy)]">{label}</p>
        {description && <p className="text-xs text-[var(--color-navy)]/50 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={cn("relative h-6 w-11 rounded-full transition-colors focus-ring shrink-0 ml-4", checked ? "bg-[var(--color-teal)]" : "bg-black/10")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export function Settings() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { supported: ttsSupported, enabled: ttsEnabled, toggle: toggleTts } = useTextToSpeech();
  const [autoStart, toggleAutoStart] = useLocalToggle("sereneai_autostart", false);
  const [notifications, toggleNotifications] = useLocalToggle("sereneai_notifications", true);

  const [name, setName] = useState(user?.name ?? "");
  const [trustedName, setTrustedName] = useState(user?.trusted_contact_name ?? "");
  const [trustedPhone, setTrustedPhone] = useState(user?.trusted_contact_phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function saveProfile() {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const updated = await api.updateMe({ name, trusted_contact_name: trustedName || undefined, trusted_contact_phone: trustedPhone || undefined });
      setUser(updated);
      setProfileMsg("Saved.");
    } catch (err) {
      setProfileMsg(err instanceof ApiError ? err.message : "Couldn't save. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setPwError(null);
    setPwMsg(null);
    try {
      await api.changePassword({ current_password: currentPw, new_password: newPw });
      setPwMsg("Password updated.");
      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : "Couldn't update password.");
    }
  }

  async function exportData() {
    const data = await api.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sereneai-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await api.deleteAccount();
      logout();
      navigate("/");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 sm:py-8 max-w-2xl w-full mx-auto">
      <h1 className="font-display text-2xl text-[var(--color-navy)]">Settings</h1>

      <h2 className="mt-9 mb-3 font-display text-lg text-[var(--color-navy)]">Personal Information</h2>
      <Card>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--color-navy)]/80">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm mt-3">
          <span className="font-medium text-[var(--color-navy)]/80">Email</span>
          <input value={user?.email ?? ""} disabled className="rounded-xl border border-[var(--color-navy)]/10 px-3.5 py-2.5 text-sm bg-black/[0.02] text-[var(--color-navy)]/50" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm mt-3">
          <span className="font-medium text-[var(--color-navy)]/80">Country</span>
          <input value={user?.country ?? ""} disabled className="rounded-xl border border-[var(--color-navy)]/10 px-3.5 py-2.5 text-sm bg-black/[0.02] text-[var(--color-navy)]/50" />
        </label>
        {profileMsg && <p className="text-sm text-[var(--color-teal-deep)] mt-3">{profileMsg}</p>}
        <Button size="sm" className="mt-4" disabled={savingProfile} onClick={saveProfile}>
          {savingProfile ? "Saving..." : "Save Changes"}
        </Button>
      </Card>

      <h2 className="mt-9 mb-3 font-display text-lg text-[var(--color-navy)]">Trusted Contact</h2>
      <Card>
        <p className="text-xs text-[var(--color-navy)]/50 mb-3">
          Shown as a quick option on the emergency screen. Never contacted automatically.
        </p>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--color-navy)]/80">Name</span>
          <input value={trustedName} onChange={(e) => setTrustedName(e.target.value)} className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]" placeholder="Optional" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm mt-3">
          <span className="font-medium text-[var(--color-navy)]/80">Phone</span>
          <input value={trustedPhone} onChange={(e) => setTrustedPhone(e.target.value)} className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]" placeholder="Optional" />
        </label>
        <Button size="sm" className="mt-4" disabled={savingProfile} onClick={saveProfile}>
          Save Contact
        </Button>
      </Card>

      <h2 className="mt-9 mb-3 font-display text-lg text-[var(--color-navy)]">Preferences</h2>
      <Card className="divide-y divide-black/5">
        <Toggle checked={notifications} onChange={toggleNotifications} label="Notifications" description="Gentle reminders to check in" />
        <Toggle
          checked={ttsSupported && ttsEnabled}
          onChange={toggleTts}
          label="Voice replies"
          description={ttsSupported ? "SereneAI reads its replies aloud" : "Not supported by this browser"}
        />
        <Toggle checked={autoStart} onChange={toggleAutoStart} label="Auto-start suggested grounding" description="Skip the extra tap after a recommendation" />
      </Card>

      <h2 className="mt-9 mb-3 font-display text-lg text-[var(--color-navy)]">Security</h2>
      <Card>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--color-navy)]/80">Current password</span>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm mt-3">
          <span className="font-medium text-[var(--color-navy)]/80">New password</span>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]" />
        </label>
        {pwError && <p className="text-sm text-[var(--color-emergency)] mt-3">{pwError}</p>}
        {pwMsg && <p className="text-sm text-[var(--color-teal-deep)] mt-3">{pwMsg}</p>}
        <Button size="sm" className="mt-4" disabled={!currentPw || !newPw} onClick={changePassword}>
          Update Password
        </Button>
      </Card>

      <h2 className="mt-9 mb-3 font-display text-lg text-[var(--color-navy)]">Privacy &amp; Data</h2>
      <Card>
        <p className="text-xs text-[var(--color-navy)]/55 leading-relaxed">
          SereneAI stores your account details, mood entries, chat sessions, AI-estimated assessments, and grounding
          history so it can personalize your experience. It does not store payment details or government IDs, and it
          is not a clinical record. You can export or delete your data at any time.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={exportData}>
            Export My Data
          </Button>
          <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => setConfirmDelete(true)}>
            Delete Account
          </Button>
        </div>
        <Link
          to="/responsible-ai"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-teal-deep)] focus-ring rounded"
        >
          <ShieldCheck size={14} />
          Read how SereneAI handles your data and AI output
        </Link>
      </Card>

      <Button variant="ghost" className="mt-7" icon={<LogOut size={15} />} onClick={() => { logout(); navigate("/"); }}>
        Logout
      </Button>

      <Disclaimer className="mt-8" />

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your account?">
        <p className="text-sm text-[var(--color-navy)]/70 leading-relaxed">
          This permanently deletes your account, sessions, mood entries and history. This can't be undone.
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="emergency" size="sm" disabled={deleting} onClick={deleteAccount}>
            {deleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
