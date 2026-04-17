import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import LanguagePicker from '../components/LanguagePicker';
import { useAuth } from '../App';
import { sendOtp, verifyOtp, getZones, registerWorker } from '../api/client';

const PLATFORMS = ['Swiggy', 'Zomato', 'Amazon', 'Flipkart', 'Zepto', 'Other'];

export default function Onboarding() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: language, 2: OTP, 3: profile
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [profile, setProfile] = useState({
    name: '', platform: 'Swiggy', zone: '', avgWeeklyEarnings: 4500, upiId: ''
  });

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setAuthError('');
    try {
      await sendOtp(phone);
      setOtpSent(true);
    } catch (e) {
      setAuthError(e?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setAuthError('');
    try {
      await verifyOtp(phone, otp);
      setStep(3);
    } catch (e) {
      setAuthError(e?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    // Use seeded worker IDs when the demo phone matches seed data,
    // so Phase-3 dashboards/pipelines can hit the real PostgreSQL rows.
    const seededWorkerIds = {
      '9876543210': 'b2000001-0000-0000-0000-000000000001',
      '9876543211': 'b2000001-0000-0000-0000-000000000002',
    };
    const workerId = seededWorkerIds[phone] || (crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`);

    (async () => {
      let finalUser = {
        id: workerId,
        phone,
        ...profile,
        language: localStorage.getItem('gigshield_lang') || 'en',
        trustScore: 100,
        weeksActive: 0,
        createdAt: new Date().toISOString(),
      };

      try {
        const zones = await getZones();
        const selectedZone = zones.find((z) =>
          String(`${z.city || ''} ${z.grid_cell || ''}`).toLowerCase().includes((profile.zone || '').toLowerCase())
        ) || zones[0];

        if (selectedZone) {
          const created = await registerWorker({
            name: profile.name,
            phone,
            language: finalUser.language,
            platform: profile.platform,
            zone_id: selectedZone.id,
            upi_id: profile.upiId,
            avg_weekly_earnings: profile.avgWeeklyEarnings,
          });
          finalUser = {
            ...finalUser,
            id: created.id || finalUser.id,
            trustScore: Number(created.trust_score ?? 100),
          };
        }
      } catch {
        // Keep client-side flow available even if gateway DB is unavailable.
      }

      login(finalUser);
      navigate('/dashboard');
    })();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1635827500881-84e4b73fcb22?auto=format&fit=crop&w=2000&q=80"
        alt="Delivery rider in rain"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-indigo-900/70 to-purple-900/75" />

      <div className="relative mx-auto max-w-md px-4 py-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-white/90 backdrop-blur">
            <ShieldCheck size={16} />
            GigShield
          </div>
        </div>

        <div className="grid gap-6 items-start">
          <div className="text-white">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">{t('onboarding.welcome')}</h1>
            <p className="mt-4 text-white/80 max-w-xl">
              {t('onboarding.tagline')}
            </p>
            <div className="mt-6 grid gap-3 grid-cols-2">
              <img
                src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80"
                alt="Rain disruption city scene"
                className="rounded-2xl h-40 w-full object-cover border border-white/30"
              />
              <img
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80"
                alt="Urban pollution disruption"
                className="rounded-2xl h-40 w-full object-cover border border-white/30"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/30 bg-white/20 backdrop-blur-xl p-6 sm:p-8 text-white">
            <div className="flex gap-2 mb-7 justify-center">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-10 bg-white' : s < step ? 'w-10 bg-indigo-200' : 'w-10 bg-white/30'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="lang-step"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                >
                  <h2 className="text-xl font-semibold mb-4">{t('onboarding.selectLanguage')}</h2>
                  <LanguagePicker onSelect={() => {}} />
                  <div className="mt-6">
                    <button onClick={() => setStep(2)} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 flex items-center justify-center gap-2 font-semibold">
                      {t('onboarding.next')} <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                >
                  <h2 className="text-xl font-semibold mb-4">{t('onboarding.enterPhone')}</h2>
                  <div className="flex gap-3 mb-4">
                    <div className="flex items-center rounded-xl px-3 bg-white/20 border border-white/30">+91</div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder={t('onboarding.phonePlaceholder')}
                      className="flex-1 rounded-xl px-4 py-3 bg-white/20 border border-white/30 outline-none placeholder:text-white/70"
                    />
                  </div>
                  {!otpSent ? (
                    <button onClick={handleSendOtp} disabled={phone.length !== 10 || loading} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 font-semibold">
                      {loading ? t('common.loading') : t('onboarding.sendOtp')}
                    </button>
                  ) : (
                    <>
                      <input
                        type="tel"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder={t('onboarding.otpPlaceholder')}
                        className="w-full mt-2 rounded-xl px-4 py-3 bg-white/20 border border-white/30 text-center tracking-widest outline-none"
                      />
                      <button onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading} className="w-full mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 font-semibold">
                        {loading ? t('common.loading') : t('onboarding.verifyOtp')}
                      </button>
                    </>
                  )}
                  {authError && <p className="mt-3 text-sm text-red-200">{authError}</p>}
                  <button onClick={() => setStep(1)} className="w-full mt-4 rounded-xl border border-white/30 py-3 flex items-center justify-center gap-2 font-medium">
                    <ChevronLeft size={18} /> {t('onboarding.back')}
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="profile-step"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold">{t('onboarding.setupProfile')}</h2>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder={t('onboarding.namePlaceholder')} className="w-full rounded-xl px-4 py-3 bg-white/20 border border-white/30 outline-none placeholder:text-white/70" />
                  <div>
                    <label className="text-sm text-white/85 mb-1 block">{t('onboarding.platform')}</label>
                    <select
                      value={profile.platform}
                      onChange={(e) => setProfile({ ...profile, platform: e.target.value })}
                      className="w-full rounded-xl px-4 py-3 bg-white/20 border border-white/30 outline-none text-white"
                    >
                      {PLATFORMS.map((platform) => (
                        <option key={platform} value={platform} className="text-slate-900">
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input type="text" value={profile.zone} onChange={e => setProfile({ ...profile, zone: e.target.value })} placeholder={t('onboarding.zonePlaceholder')} className="w-full rounded-xl px-4 py-3 bg-white/20 border border-white/30 outline-none placeholder:text-white/70" />
                  <div>
                    <label className="text-sm text-white/85 mb-1 block">
                      {t('onboarding.earnings')}: ₹{profile.avgWeeklyEarnings}
                    </label>
                    <input
                      type="range"
                      min={1500}
                      max={12000}
                      step={500}
                      value={profile.avgWeeklyEarnings}
                      onChange={(e) => setProfile({ ...profile, avgWeeklyEarnings: Number(e.target.value) })}
                      className="w-full accent-indigo-400"
                    />
                    <div className="flex justify-between text-xs text-white/70">
                      <span>₹1,500</span>
                      <span>₹12,000</span>
                    </div>
                  </div>
                  <input type="text" value={profile.upiId} onChange={e => setProfile({ ...profile, upiId: e.target.value })} placeholder={t('onboarding.upiPlaceholder')} className="w-full rounded-xl px-4 py-3 bg-white/20 border border-white/30 outline-none placeholder:text-white/70" />
                  <button onClick={handleComplete} disabled={!profile.name || !profile.zone || !profile.upiId} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-3 font-semibold">
                    {t('onboarding.done')}
                  </button>
                  <button onClick={() => setStep(2)} className="w-full rounded-xl border border-white/30 py-3 flex items-center justify-center gap-2 font-medium">
                    <ChevronLeft size={18} /> {t('onboarding.back')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
