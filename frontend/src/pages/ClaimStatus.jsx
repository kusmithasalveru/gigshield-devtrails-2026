import { useMemo, useState } from 'react';
import { useAuth } from '../App';
import { simulateEvent } from '../api/mlApi';
import useGeoLocation from '../hooks/useGeoLocation';
import { Search, ShieldCheck, CheckCircle2, Clock, Activity, CloudRain, Wind } from 'lucide-react';

export default function ClaimStatus() {
  const { user } = useAuth();
  const { latitude, longitude, refresh, error: geoError } = useGeoLocation();

  const [kind, setKind] = useState('rain'); // "rain" | "pollution"
  const [loading, setLoading] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [data, setData] = useState(null);

  const activeIdx = useMemo(() => {
    if (!data) return -1;
    // 0: event detected, 1: AI validation, 2: approved, 3: paid
    const decision = data?.fraud?.decision;
    const paid = data?.payout?.status;

    if (decision === 'auto_approve') {
      return paid === 'completed' ? 3 : 2;
    }
    // Not approved -> paid can't complete
    return 1;
  }, [data]);

  const submit = async () => {
    setLoading(true);
    setSimulated(false);
    setErrMsg('');
    setData(null);
    try {
      const res = await simulateEvent({
        worker_id: user?.id,
        gps_lat: Number(latitude || 0),
        gps_lng: Number(longitude || 0),
        event_kind: kind,
        severity: 'HIGH',
        disrupted_hours: 2,
        // give fraud engine some knobs so judges can see AI decision changes
        last_activity_hours_ago: 0.5,
        claims_past_30d: 1,
        claim_to_coverage_ratio: 0.3,
        earnings_match_score: 0.85,
      });
      setData(res);
    } catch (e) {
      setSimulated(true);
      setErrMsg(e?.message || 'API failed');
      setData({
        event_id: crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`,
        event_type: kind === 'rain' ? 'heavy_rain' : 'severe_pollution',
        fraud: { anomaly_score: 0.64, decision: 'human_review', flags: ['Simulated Response (API failed)'], shap_explanation: null },
        payout: { payout_id: 'sim-pay-001', amount: 140, status: 'held', razorpay_ref: null },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Claims Flow</h1>
          <p className="text-sm text-gray-500 mt-1">Event → AI Validation → Approved → Paid</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
            <Activity size={18} className="text-primary-700" />
          </div>
        </div>
      </div>

      {geoError && (
        <div className="card text-amber-800 bg-amber-50 border-amber-100 text-sm">
          Geolocation unavailable: {geoError}
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-primary-700" />
          <p className="font-semibold">Simulate Disruption</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setKind('rain')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border ${
              kind === 'rain' ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <CloudRain size={16} className="inline-block mr-2" /> Rain
          </button>
          <button
            type="button"
            onClick={() => setKind('pollution')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border ${
              kind === 'pollution' ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <Wind size={16} className="inline-block mr-2" /> Pollution
          </button>
        </div>

        <button type="button" onClick={() => refresh()} className="btn-secondary w-full flex items-center justify-center gap-2">
          <ShieldCheck size={16} />
          Use my GPS
        </button>
      </div>

      <button onClick={submit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? <Clock size={18} className="animate-spin" /> : <Clock size={18} />}
        {loading ? 'Simulating...' : 'Auto Claim Enabled'}
      </button>

      {simulated && <div className="text-sm text-amber-800 font-semibold">Simulated Response</div>}
      {errMsg && simulated && <div className="text-sm text-amber-900/80">{errMsg}</div>}

      {data && (
        <>
          <div className="card">
            <div className="flex items-center gap-1">
              {[{ label: 'Event Detected', icon: Search }, { label: 'AI Validation', icon: ShieldCheck }, { label: 'Approved', icon: CheckCircle2 }, { label: 'Paid', icon: CheckCircle2 }].map(
                (s, idx) => {
                  const done = idx <= activeIdx;
                  return (
                    <div key={s.label} className="flex items-center flex-1">
                      <div className={`flex flex-col items-center flex-1 ${done ? 'text-primary-600' : 'text-gray-300'}`}>
                        {idx === 0 ? (
                          <Search size={18} className={done ? '' : ''} />
                        ) : idx === 1 ? (
                          <ShieldCheck size={18} className={done ? '' : ''} />
                        ) : idx === 2 ? (
                          <CheckCircle2 size={18} className={done ? '' : ''} />
                        ) : (
                          <CheckCircle2 size={18} className={done ? '' : ''} />
                        )}
                        <span className="text-[11px] mt-1 font-medium">{s.label}</span>
                      </div>
                      {idx < 3 && (
                        <div className={`h-0.5 flex-1 mx-1 rounded ${idx < activeIdx ? 'bg-primary-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="card">
              <p className="font-semibold text-sm">AI Validation</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-gray-500">Anomaly score</p>
                  <p className="text-lg font-bold">{Number(data?.fraud?.anomaly_score || 0).toFixed(3)}</p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    data?.fraud?.decision === 'auto_approve' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {data?.fraud?.decision}
                </span>
              </div>
              {(data?.fraud?.flags || []).length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {data.fraud.flags.slice(0, 4).map((f, i) => (
                    <span key={`${f}-${i}`} className="text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-800">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <p className="font-semibold text-sm">Payout</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-gray-500">Amount</p>
                  <p className="text-lg font-bold">₹{Number(data?.payout?.amount || 0)}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      data?.payout?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {data?.payout?.status}
                  </span>
                  {data?.payout?.razorpay_ref ? (
                    <p className="text-[11px] text-gray-500 mt-1">Ref: {data.payout.razorpay_ref}</p>
                  ) : (
                    <p className="text-[11px] text-gray-500 mt-1">Ref: mock</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
