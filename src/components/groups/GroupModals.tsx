import React, { useState } from 'react';
import { X, Users, UserPlus, KeyRound, Sparkles, Check, Copy, Image as ImageIcon, QrCode, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COVER_PRESETS = [
  {
    name: 'Beach Sunset',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Foodie Dining',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Mountain Peak',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Speakeasy Nightlife',
    url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
  },
];

export const CreateGroupModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { createGroup } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(COVER_PRESETS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCover = customCoverUrl.trim() || selectedCover;
    const newGroup = createGroup(name.trim(), description.trim(), finalCover);
    setCreatedInviteCode(newGroup.inviteCode);
    setCreatedGroupId(newGroup.id);
  };

  const handleCopyCode = () => {
    if (createdInviteCode) {
      navigator.clipboard.writeText(createdInviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFinish = () => {
    onClose();
    setName('');
    setDescription('');
    setCustomCoverUrl('');
    setCreatedInviteCode(null);
    if (createdGroupId) {
      navigate(`/groups/${createdGroupId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create a Group</h3>
              <p className="text-xs text-slate-400">Start a new private map with your friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {createdInviteCode ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Group Created!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Share this unique invite code with your squad:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-mono text-2xl font-extrabold tracking-widest text-purple-600 dark:text-purple-400">
                {createdInviteCode}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => setShowQrModal(!showQrModal)}
                  className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Show QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showQrModal && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
                <div className="w-32 h-32 mx-auto bg-slate-900 p-2 rounded-xl border border-slate-700 flex items-center justify-center">
                  <div className="font-mono text-xs font-extrabold text-purple-400 tracking-wider">
                    QR: {createdInviteCode}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">Scan to join on mobile</p>
              </div>
            )}

            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-glow-brand transition-all"
            >
              Open Group Map
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Group Name *
              </label>
              <input
                type="text"
                required
                placeholder='e.g. "The Boys 🌴", "Riding Buddies"'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm border border-slate-200 dark:border-slate-800 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Description / Vibe
              </label>
              <textarea
                rows={2}
                placeholder="What is this group about? (e.g. coffee runs, weekend roadtrips)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs border border-slate-200 dark:border-slate-800 focus:border-purple-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Cover Photo Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setSelectedCover(preset.url);
                      setCustomCoverUrl('');
                    }}
                    className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedCover === preset.url && !customCoverUrl
                        ? 'border-purple-600 ring-2 ring-purple-500/30'
                        : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-purple-500" /> Custom Cover URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs border border-slate-200 dark:border-slate-800 focus:border-purple-500 outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-glow-brand transition-all"
              >
                Create & Generate Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const JoinGroupModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { joinGroup } = useApp();
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState('');
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    const res = joinGroup(inviteCode);
    setFeedback(res);

    if (res.success && res.group) {
      setTimeout(() => {
        onClose();
        setInviteCode('');
        setFeedback({});
        navigate(`/groups/${res.group?.id}`);
      }, 1000);
    }
  };

  // Render slots dynamically for up to 8 characters
  const boxCount = Math.max(6, inviteCode.length);
  const chars = Array.from({ length: boxCount }, (_, i) => inviteCode[i] || '');

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Join a Group</h3>
              <p className="text-xs text-slate-400">Enter the invite code from your friend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body matching mockup code boxes */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-center">
          {feedback.message && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold ${
                feedback.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Enter Group Invite Code
            </label>

            <div className="relative">
              <input
                type="text"
                maxLength={8}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                autoFocus
              />

              <div className="flex justify-center gap-1.5">
                {chars.map((char, index) => (
                  <div
                    key={index}
                    className={`w-10 h-12 rounded-xl border-2 font-mono font-extrabold text-lg flex items-center justify-center transition-all ${
                      char
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400'
                    }`}
                  >
                    {char}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-glow-brand transition-all"
          >
            Join Group
          </button>
        </form>
      </div>
    </div>
  );
};
