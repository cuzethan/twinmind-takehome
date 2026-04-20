type SettingsModalProps = {
  isOpen: boolean;
  groqkey: string;
  model: string;
  onGroqkeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function SettingsModal({
  isOpen,
  groqkey,
  model,
  onGroqkeyChange,
  onModelChange,
  onClose,
  onSave,
}: SettingsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-600">Edit your app settings below.</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="groq-key">
              Groq API Key
            </label>
            <input
              id="groq-key"
              type="text"
              value={groqkey}
              onChange={(event) => onGroqkeyChange(event.target.value)}
              placeholder="Enter your API key"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="model">
              Model
            </label>
            <input
              id="model"
              type="text"
              value={model}
              onChange={(event) => onModelChange(event.target.value)}
              placeholder="e.g. llama-3.1-8b-instant"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-md bg-blue-500 px-3 py-2 text-sm text-white cursor-pointer hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
