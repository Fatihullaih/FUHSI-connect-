import React, { useState } from 'react';
import { PostCategory, UserProfile } from '../types';
import { INITIAL_USER_PROFILE } from '../data/initialData';
import { AvatarIcon } from './AvatarIcon';
import { X, Sparkles, Send, EyeOff, ShieldCheck, HelpCircle, BarChart2, Plus, AlertTriangle } from 'lucide-react';

interface CreatePostModalProps {
  userProfile?: UserProfile | null;
  user?: UserProfile | null;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (
    data: {
      content: string;
      department: string;
      category: string;
      pollQuestion?: string;
      pollOptA?: string;
      pollOptB?: string;
    }
  ) => void;
  onCreatePost?: (content: string, category: PostCategory, customNickname?: string) => void;
  checkDoxxingThreats?: (text: string) => boolean;
}

const CATEGORIES: PostCategory[] = [
  'General',
  'Academic',
  'Events',
  'Confessions',
  'Marketplace',
  'LostAndFound'
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  userProfile,
  user,
  isOpen = true,
  onClose,
  onSubmit,
  onCreatePost,
  checkDoxxingThreats,
}) => {
  const currentUser = userProfile || user || INITIAL_USER_PROFILE;
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('General');
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptA, setPollOptA] = useState('');
  const [pollOptB, setPollOptB] = useState('');
  const [doxxingWarning, setDoxxingWarning] = useState(false);

  if (isOpen === false) return null;

  const handleContentChange = (text: string) => {
    setContent(text);
    if (checkDoxxingThreats && text.trim()) {
      setDoxxingWarning(checkDoxxingThreats(text));
    } else {
      setDoxxingWarning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (onSubmit) {
      onSubmit({
        content: content.trim(),
        department: currentUser?.department || 'General',
        category,
        pollQuestion: hasPoll ? pollQuestion.trim() : undefined,
        pollOptA: hasPoll ? pollOptA.trim() : undefined,
        pollOptB: hasPoll ? pollOptB.trim() : undefined,
      });
    } else if (onCreatePost) {
      onCreatePost(content.trim(), category);
    }

    setContent('');
    setPollQuestion('');
    setPollOptA('');
    setPollOptB('');
    setHasPoll(false);
    onClose();
  };

  const nickname = currentUser?.nickname || '@FUHSIStudent';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Create Campus Post</h3>
              <p className="text-xs text-slate-500">Share insights, ask questions, or run student polls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Identity Bar */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                <AvatarIcon avatarKey={currentUser?.avatarKey} size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{nickname}</span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {`${currentUser?.department} • ${currentUser?.level}`}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
              Verified Handle
            </span>
          </div>

          {/* Doxxing / Privacy Alert */}
          {doxxingWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Anti-Doxxing Guard: Phone numbers or personal contacts detected. Ensure you are not sharing sensitive credentials.</span>
            </div>
          )}

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Post Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    category === cat
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Post Content Area */}
          <div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="What's happening on campus? Share revision notes, ask about clinical postings, or voice a concern..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Campus Poll Options */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setHasPoll(!hasPoll)}
              className="text-xs font-bold text-teal-700 flex items-center gap-1.5 hover:underline mb-2"
            >
              <BarChart2 size={16} />
              <span>{hasPoll ? 'Remove Campus Poll' : '+ Attach Anonymous Poll'}</span>
            </button>

            {hasPoll && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
                <input
                  type="text"
                  placeholder="Poll Question (e.g. Should Saturday CBT start by 8 AM?)"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-teal-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Option A (e.g. Yes)"
                    value={pollOptA}
                    onChange={(e) => setPollOptA(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Option B (e.g. No)"
                    value={pollOptB}
                    onChange={(e) => setPollOptB(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <ShieldCheck size={14} className="text-teal-600" />
              <span>Protected by Anti-Doxxing Shield</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>Publish Post</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
