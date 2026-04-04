import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Phone, User, ChevronRight, ChevronLeft } from 'lucide-react';
import LanguagePicker from '../components/LanguagePicker';
import { useAuth } from '../App';
import { sendOtp, verifyOtp } from '../api/client';

const PLATFORMS = ['Swiggy', 'Zomato', 'Amazon', 'Zepto', 'Other'];

export default function Onboarding() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: language, 2: OTP, 3: profile
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '', platform: 'Swiggy', zone: '', avgWeeklyEarnings: 4500, upiId: ''
  });

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    await sendOtp(phone);
    setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    await verifyOtp(phone, otp);
    setLoading(false);
    setStep(3);
  };

  const handleComplete = () => {
    login({
      id: 'u-' + Date.now(),
      phone,
      ...profile,
      language: localStorage.getItem('gigshield_lang') || 'en',
      trustScore: 50,
      weeksActive: 0,
      createdAt: new Date().toISOString()
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto px-6 py-8 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
          <ShieldCheck size={32} className="text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('onboarding.welcome')}</h1>
        <p className="text-gray-500 mt-1">{t('onboarding.tagline')}</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8 justify-center">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-primary-600' : s < step ? 'w-8 bg-primary-300' : 'w-8 bg-gray-200'}`} />
        ))}
      </div>

      {/* Step 1: Language */}
      {step === 1 && (
        <div className="flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">{t('onboarding.selectLanguage')}</h2>
          <LanguagePicker onSelect={() => {}} />
          <div className="mt-auto pt-6">
            <button onClick={() => setStep(2)} className="btn-primary w-full flex items-center justify-center gap-2">
              {t('onboarding.next')} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Phone & OTP */}
      {step === 2 && (
        <div className="flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">{t('onboarding.enterPhone')}</h2>

          <div className="flex gap-3 mb-4">
            <div className="flex items-center bg-gray-100 rounded-xl px-3 text-gray-500 font-medium">+91</div>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder={t('onboarding.phonePlaceholder')}
              className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={phone.length !== 10 || loading}
              className="btn-primary w-full mb-4"
            >
              {loading ? t('common.loading') : t('onboarding.sendOtp')}
            </button>
          ) : (
            <>
              <h3 className="text-base font-medium mb-2">{t('onboarding.enterOtp')}</h3>
              <input
                type="tel"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder={t('onboarding.otpPlaceholder')}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-lg text-center tracking-widest outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
                className="btn-primary w-full"
              >
                {loading ? t('common.loading') : t('onboarding.verifyOtp')}
              </button>
            </>
          )}

          <div className="mt-auto pt-6">
            <button onClick={() => setStep(1)} className="btn-secondary w-full flex items-center justify-center gap-2">
              <ChevronLeft size={18} /> {t('onboarding.back')}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Profile */}
      {step === 3 && (
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t('onboarding.setupProfile')}</h2>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t('onboarding.name')}</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              placeholder={t('onboarding.namePlaceholder')}
              className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t('onboarding.platform')}</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setProfile({ ...profile, platform: p })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium min-h-touch border-2 transition-all ${
                    profile.platform === p
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t('onboarding.zone')}</label>
            <input
              type="text"
              value={profile.zone}
              onChange={e => setProfile({ ...profile, zone: e.target.value })}
              placeholder={t('onboarding.zonePlaceholder')}
              className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              {t('onboarding.earnings')}: ₹{profile.avgWeeklyEarnings}
            </label>
            <input
              type="range"
              min={1500}
              max={9000}
              step={500}
              value={profile.avgWeeklyEarnings}
              onChange={e => setProfile({ ...profile, avgWeeklyEarnings: Number(e.target.value) })}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>₹1,500</span><span>₹9,000</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t('onboarding.upi')}</label>
            <input
              type="text"
              value={profile.upiId}
              onChange={e => setProfile({ ...profile, upiId: e.target.value })}
              placeholder={t('onboarding.upiPlaceholder')}
              className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mt-auto pt-4 space-y-3">
            <button
              onClick={handleComplete}
              disabled={!profile.name || !profile.zone || !profile.upiId}
              className="btn-primary w-full"
            >
              {t('onboarding.done')}
            </button>
            <button onClick={() => setStep(2)} className="btn-secondary w-full flex items-center justify-center gap-2">
              <ChevronLeft size={18} /> {t('onboarding.back')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
