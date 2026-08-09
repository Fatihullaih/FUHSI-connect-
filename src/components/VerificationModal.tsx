import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle, 
  Award, 
  Sparkles, 
  Clock, 
  Check, 
  AlertCircle,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  UserCheck,
  Building,
  Crown
} from 'lucide-react';
import { UserProfile } from '../types';
import { VerificationBadge } from './VerificationBadge';

interface VerificationModalProps {
  userProfile: UserProfile | null;
  onClose: () => void;
  onSubmitVerification: (data: {
    accountType: 'Student' | 'Executive' | 'Organization';
    positionTitle: string;
    matricNumber?: string;
    department?: string;
    level?: string;
    proofDetails?: string;
    paymentRef: string;
    amountPaid: number;
  }) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  userProfile,
  onClose,
  onSubmitVerification,
}) => {
  // Read dynamic fee set by Admin or default to 1500
  const [feeAmount, setFeeAmount] = useState<number>(() => {
    try {
      const storedFee = localStorage.getItem('fuhsi_verification_fee');
      if (storedFee) {
        const parsed = parseInt(storedFee, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch {
      // ignore error
    }
    return 1500;
  });

  const [accountType, setAccountType] = useState<'Student' | 'Executive' | 'Organization'>('Student');
  const [positionTitle, setPositionTitle] = useState('');

  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedPaymentRef, setSubmittedPaymentRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isAlreadyVerified = useMemo(() => {
    if (userProfile?.isVerified || userProfile?.verificationStatus === 'approved') return true;
    try {
      const vStr = localStorage.getItem('fuhsi_verifications_db');
      if (vStr && userProfile?.nickname) {
        const vList: any[] = JSON.parse(vStr);
        const cleanNick = userProfile.nickname.toLowerCase().replace(/^@/, '');
        return vList.some(
          (v) =>
            v.status === 'APPROVED' &&
            (v.applicantNickname?.toLowerCase().replace(/^@/, '') === cleanNick ||
              v.applicantNickname?.toLowerCase() === userProfile.nickname.toLowerCase())
        );
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }, [userProfile]);
  const isPending = userProfile?.verificationStatus === 'pending' || isSubmittedSuccess;

  const handleOpenPaymentGateway = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const ref = `SQUADCO-FY7TM2-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedPaymentRef(ref);

    // Submit details tendered to Admin
    onSubmitVerification({
      accountType,
      positionTitle: positionTitle.trim(),
      matricNumber: userProfile?.matricNumber || 'N/A',
      department: userProfile?.department || 'N/A',
      level: userProfile?.level || 'N/A',
      proofDetails: positionTitle.trim() ? `Position Held: ${positionTitle.trim()}` : 'Standard Verification Request',
      paymentRef: ref,
      amountPaid: feeAmount,
    });

    setIsSubmittedSuccess(true);

    // Redirect user to SquadCo Payment Gateway
    try {
      window.open('https://pay.squadco.com/FY7TM2', '_blank');
    } catch {
      // Fallback if popups are blocked
    }
  };

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const ref = `PAY-FUHSI-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedPaymentRef(ref);
      setIsProcessingPayment(false);
      setShowPaymentGateway(false);

      onSubmitVerification({
        accountType,
        positionTitle: positionTitle.trim(),
        matricNumber: userProfile?.matricNumber || 'N/A',
        department: userProfile?.department || 'N/A',
        level: userProfile?.level || 'N/A',
        proofDetails: positionTitle.trim() ? `Position Held: ${positionTitle.trim()}` : 'Verified via subscription gateway',
        paymentRef: ref,
        amountPaid: feeAmount,
      });

      setIsSubmittedSuccess(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Top Bar Navigation */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
                <span>Get Verified</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Intro Description */}
          <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 border border-slate-800">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Get Verified on FUHSI Connect
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Verification provides additional benefits and helps users access exclusive features on the platform, establishing high trust for students, campus executives, and student organizations.
            </p>
          </div>

          {/* Current Status Banner */}
          {isAlreadyVerified ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3 shadow-xs">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
                  <span>Your Account is Verified</span>
                  <VerificationBadge isVerified badgeType={userProfile?.badgeType} title={userProfile?.badgeTitle} showTitle />
                </div>
                <p className="text-xs text-emerald-800 font-medium mt-0.5 leading-relaxed">
                  Your official identity has been authenticated by FUHSI Administration. Your posts and profile display your verified checkmark everywhere across the platform.
                </p>
              </div>
            </div>
          ) : isPending ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-600 shrink-0 animate-pulse" />
                <div>
                  <span className="font-extrabold text-sm text-amber-900">Verification Application Submitted</span>
                  <p className="text-xs text-amber-800 font-medium mt-0.5">
                    Your request & payment reference <strong className="font-mono text-slate-900">{submittedPaymentRef || 'PAY-SQUADCO-SUBMITTED'}</strong> were sent to Admin for approval.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/90 text-slate-800 flex items-center gap-3 shadow-xs">
              <div className="p-2 rounded-xl bg-amber-100/80 text-amber-700 shrink-0 border border-amber-200/60">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span>Account Not Verified</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">Unverified</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                  Your account is currently unverified. Review the benefits below, select your category, and click Subscribe & Pay to apply for verification.
                </p>
              </div>
            </div>
          )}

          {/* Verification Benefits */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Verification Benefits
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800 font-medium">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>Verified account status displayed on profile, posts, and comments.</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Higher trust and credibility within the campus community.</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Increased visibility for academic posts, threads, and marketplace listings.</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>Priority support from the FUHSI Connect administration team.</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Early access to selected new features and campus tool updates.</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <Crown className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Eligibility for future premium campus features, badges, and services.</span>
              </div>
            </div>
          </div>

          {/* Form & Fee Section (if not yet verified/pending) */}
          {!isAlreadyVerified && !isPending && (
            <form onSubmit={handleOpenPaymentGateway} className="pt-3 border-t border-slate-200 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Account Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Verification Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setAccountType('Student'); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      accountType === 'Student' 
                        ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck size={16} className={accountType === 'Student' ? 'text-sky-600' : ''} />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAccountType('Executive'); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      accountType === 'Executive' 
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Crown size={16} className={accountType === 'Executive' ? 'text-emerald-600' : ''} />
                    <span>Executive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAccountType('Organization'); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      accountType === 'Organization' 
                        ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Building size={16} className={accountType === 'Organization' ? 'text-amber-600' : ''} />
                    <span>Organization</span>
                  </button>
                </div>
              </div>

              {/* Additional Position Held (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Position Held (Optional)
                </label>
                <input
                  type="text"
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  placeholder="e.g. Class Representative, Departmental President, SUG Executive, Club President"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  If you hold any leadership or official campus position, enter it here. Otherwise, leave this field empty.
                </p>
              </div>

              {/* Verification Fee Display */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                    Verification Fee
                  </span>
                  <div className="text-xl font-black text-white mt-0.5">
                    ₦{feeAmount.toLocaleString()}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Lock size={12} className="text-emerald-400" />
                  <span>Secure Payment Gateway</span>
                </div>
              </div>

              {/* Subscribe & Pay Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-700 font-extrabold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="bg-black hover:bg-slate-800 text-white px-6 py-3 rounded-full text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <CreditCard size={16} />
                  <span>Subscribe & Pay ₦{feeAmount.toLocaleString()}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {(isAlreadyVerified || isPending) && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-black hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-xs font-black transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Interactive Payment Gateway Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Payment Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-xs tracking-wider uppercase">FUHSI Connect Secure Pay</span>
              </div>
              <button
                onClick={() => setShowPaymentGateway(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Verification Subscription</span>
                <div className="text-2xl font-black text-slate-900">₦{feeAmount.toLocaleString()}</div>
                <p className="text-xs text-slate-600 font-medium">
                  {userProfile?.nickname} • {accountType} {positionTitle ? `(${positionTitle})` : ''}
                </p>
              </div>

              {/* Method Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-1.5 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                    paymentMethod === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`py-1.5 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                    paymentMethod === 'transfer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ussd')}
                  className={`py-1.5 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                    paymentMethod === 'ussd' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  USSD
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      readOnly
                      value="5399 •••• •••• 4021"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry</label>
                      <input
                        type="text"
                        readOnly
                        value="08/28"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV</label>
                      <input
                        type="text"
                        readOnly
                        value="***"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Bank Name:</span>
                    <span>FUHSI Microfinance Bank</span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span>Account No:</span>
                    <span className="font-mono text-sm text-sky-900">8031234567</span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span>Account Name:</span>
                    <span>FUHSI Connect Verifications</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'ussd' && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-center space-y-1 text-xs">
                  <span className="font-extrabold text-amber-900 block">Dial USSD Code:</span>
                  <span className="font-mono text-base font-black text-amber-950 block">*737*2*1500*8031234567#</span>
                </div>
              )}

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleSimulatePayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Confirm & Complete Payment ₦{feeAmount.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
