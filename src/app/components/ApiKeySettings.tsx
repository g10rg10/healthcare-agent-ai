import { useState } from 'react';
import { Settings, X, Check } from 'lucide-react';

export function useGroqApiKey(): string {
  return (
    import.meta.env.VITE_GROQ_API_KEY ||
    localStorage.getItem('groq_api_key') ||
    ''
  );
}

export default function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('groq_api_key', key.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
      setKey('');
    }, 1200);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="API Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">API Settings</h2>
              <button onClick={() => { setOpen(false); setKey(''); }} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Groq API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && key.trim() && handleSave()}
              placeholder="gsk_..."
              autoComplete="off"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3D38F5] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              La chiave viene salvata localmente nel browser e non viene mai caricata su GitHub.
            </p>

            <button
              onClick={handleSave}
              disabled={!key.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all disabled:opacity-40"
              style={{ backgroundColor: '#3D38F5' }}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Salvata!
                </>
              ) : (
                'Salva chiave'
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
