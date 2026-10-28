import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { BalanceIcon, HomeIcon, TransactionIcon } from "../../../assets";
import { homepageService } from "../../../services/homepage.service";
import { BUSINESS_NAME_MAX_LENGTH } from "../../../config/defaults";

interface BusinessNameEditorProps {
  username: string;
  isDefault: boolean;
  savedName: string;
  fallbackName: string;
  onSaved: (businessName: string) => void;
}

const previewLinks = [
  { name: "Home", Icon: HomeIcon },
  { name: "Balances", Icon: BalanceIcon },
  { name: "Transactions", Icon: TransactionIcon },
];

const BusinessNameEditor = ({
  username,
  isDefault,
  savedName,
  fallbackName,
  onSaved,
}: BusinessNameEditorProps) => {
  const [draft, setDraft] = useState(savedName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const trimmedDraft = draft.trim();
  const previewName = trimmedDraft || savedName || fallbackName;
  const canSave =
    trimmedDraft.length > 0 &&
    trimmedDraft !== savedName &&
    status !== "saving";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    try {
      setStatus("saving");
      setError(null);
      await homepageService.updateBusinessName(username, trimmedDraft);
      setDraft(trimmedDraft);
      setStatus("saved");
      onSaved(trimmedDraft);
    } catch (err) {
      console.error("Error saving business name:", err);
      setError(
        err instanceof TypeError || !(err instanceof Error)
          ? "Couldn't reach the server. Check it's running and try again."
          : err.message
      );
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid grid-cols-1 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_32px_-16px_rgba(16,24,40,0.22)] md:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="flex flex-col justify-center p-6">
        <label
          htmlFor="business-name"
          className="block text-base font-semibold text-gray-900"
        >
          Business name
        </label>
        <p id="business-name-hint" className="mt-1 text-sm text-gray-600">
          {isDefault
            ? `Shown on / and /${username}. As the default business, it also appears on Transactions and for any business without its own name.`
            : `Shown in the sidebar and browser tab on /${username}.`}
        </p>

        <div className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              id="business-name"
              type="text"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (status !== "saving") setStatus("idle");
              }}
              maxLength={BUSINESS_NAME_MAX_LENGTH}
              placeholder="Business name…"
              autoComplete="organization"
              aria-describedby="business-name-hint business-name-status"
              aria-invalid={status === "error"}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-16 text-gray-900 placeholder:text-gray-500 transition-colors focus:border-[#533afd] focus:outline-none focus:ring-2 focus:ring-[#533afd]/25"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums text-gray-500">
              {draft.length}/{BUSINESS_NAME_MAX_LENGTH}
            </span>
          </div>
          <button
            type="submit"
            disabled={!canSave}
            className="cursor-pointer rounded-lg bg-[#533afd] px-5 py-2 font-medium text-white shadow-[0_1px_2px_rgba(83,58,253,0.3),0_6px_14px_-4px_rgba(83,58,253,0.45)] transition duration-200 ease-out hover:-translate-y-px hover:bg-[#4430e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#533afd] focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {status === "saving" ? "Saving…" : "Save name"}
          </button>
        </div>

        <p
          id="business-name-status"
          aria-live="polite"
          className="mt-2 min-h-5 text-sm"
        >
          {status === "error" ? (
            <span className="text-red-700">{error}</span>
          ) : status === "saved" ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <Check className="size-4" />
              Saved. The sidebar now shows this name.
            </span>
          ) : !savedName ? (
            <span className="text-gray-600">
              Not set yet. Showing the default name, “{fallbackName}”, until
              you save one.
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex flex-col justify-center gap-3 bg-[#0a2540] px-6 py-8">
        <span className="text-sm text-[#adbdcc]">Sidebar preview</span>
        <div
          className="w-60 max-w-full rounded-lg bg-white py-3 text-[#353a44] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.6)]"
          aria-hidden="true"
        >
          <div className="mx-5 flex h-7.5 min-w-0 items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#f5f6f8] text-xs font-semibold">
              {previewName.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 truncate text-sm font-semibold">
              {previewName}
            </span>
            <ChevronDown className="ml-auto size-3 shrink-0 stroke-3" />
          </div>
          <ul className="mx-5 mt-2 border-t border-[#ebeef1] pt-2">
            {previewLinks.map(({ name, Icon }) => (
              <li key={name} className="flex h-7.5 items-center gap-2">
                <span className="p-1">
                  <Icon className="size-4 shrink-0 text-[#9097a5]" />
                </span>
                <span className="text-sm">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </form>
  );
};

export default BusinessNameEditor;
