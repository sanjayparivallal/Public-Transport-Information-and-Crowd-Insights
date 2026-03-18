import { useEffect, useMemo, useState } from 'react';
import { SearchIcon, MapIcon } from '../../components/icons';

const FareCalculator = ({ fareTable }) => {
  const [fareFrom, setFareFrom]     = useState('');
  const [fareTo, setFareTo]         = useState('');
  const [fareResult, setFareResult] = useState(null);
  const [fareClass, setFareClass]   = useState('');

  const normalize = (v) => String(v || '').trim().toLowerCase();

  const normalizedFares = useMemo(
    () => (fareTable || []).map((f) => ({
      ...f,
      _from: normalize(f.fromStop),
      _to: normalize(f.toStop),
      _class: f.fareClass || 'general',
    })),
    [fareTable]
  );

  const stopSuggestions = useMemo(() => {
    const stopSet = new Set();
    normalizedFares.forEach((f) => {
      if (f.fromStop) stopSet.add(f.fromStop);
      if (f.toStop) stopSet.add(f.toStop);
    });
    return Array.from(stopSet).sort((a, b) => a.localeCompare(b));
  }, [normalizedFares]);

  const pairFares = useMemo(() => {
    const from = normalize(fareFrom);
    const to = normalize(fareTo);
    if (!from || !to) return [];
    return normalizedFares.filter((f) =>
      (f._from === from && f._to === to) || (f._from === to && f._to === from)
    );
  }, [normalizedFares, fareFrom, fareTo]);

  const availableClasses = useMemo(() => {
    const source = pairFares.length ? pairFares : normalizedFares;
    return Array.from(new Set(source.map((f) => f._class)));
  }, [pairFares, normalizedFares]);

  useEffect(() => {
    if (!availableClasses.length) {
      setFareClass('');
      return;
    }
    if (!fareClass || !availableClasses.includes(fareClass)) {
      setFareClass(availableClasses[0]);
    }
  }, [availableClasses, fareClass]);

  const classLabel = {
    general: 'General Class',
    AC: 'Premium AC',
    sleeper: 'Sleeper / Extended',
  };

  const handleFareCalc = () => {
    if (!fareFrom || !fareTo) return;
    if (!normalizedFares.length) { setFareResult('No data'); return; }
    const from = normalize(fareFrom);
    const to = normalize(fareTo);
    const entry = normalizedFares.find(
      (f) =>
        ((f._from === from && f._to === to) || (f._from === to && f._to === from)) &&
        f._class === fareClass
    );
    if (entry) {
      setFareResult({ amount: entry.fare, class: entry._class });
    } else {
      setFareResult('not_found');
    }
  };

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <MapIcon size={80} />
      </div>

      <div className="flex items-center text-lg font-black text-slate-800 mb-6 pb-4 border-b border-slate-50">
        <div className="p-2 bg-primary-50 rounded-xl mr-3 text-primary-600">
           <SearchIcon size={20} />
        </div>
        Fare Estimation
      </div>
      
      {fareTable?.length > 0 ? (
        <div className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <label className="label">Origin Stop</label>
              <input
                type="text"
                list="fare-stops"
                className="input"
                placeholder="e.g. Salem Junction"
                value={fareFrom}
                onChange={e => { setFareFrom(e.target.value); setFareResult(null); }}
              />
            </div>
            <div className="space-y-2">
              <label className="label">Destination</label>
              <input
                type="text"
                list="fare-stops"
                className="input"
                placeholder="e.g. Chennai Central"
                value={fareTo}
                onChange={e => { setFareTo(e.target.value); setFareResult(null); }}
              />
            </div>
            <div className="space-y-2">
              <label className="label">Travel Class</label>
              <select
                className="input"
                value={fareClass}
                onChange={e => { setFareClass(e.target.value); setFareResult(null); }}
                disabled={!availableClasses.length}
              >
                {!availableClasses.length ? (
                  <option value="">No class available</option>
                ) : (
                  availableClasses.map((c) => (
                    <option key={c} value={c}>{classLabel[c] || c}</option>
                  ))
                )}
              </select>
              {fareFrom && fareTo && !pairFares.length && (
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider ml-1">
                  No fare entries available for this stop pair.
                </p>
              )}
            </div>
          </div>

          <datalist id="fare-stops">
            {stopSuggestions.map((stop) => (
              <option key={stop} value={stop} />
            ))}
          </datalist>
          
          <button
            className="btn-primary w-full justify-center"
            onClick={handleFareCalc}
            disabled={!fareFrom || !fareTo || !fareClass || (fareFrom && fareTo && !pairFares.length)}
          >
            Calculate Tariff
          </button>
          
          {fareResult && (
            <div className="mt-8 p-6 bg-slate-900 rounded-4xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500 border-t-4 border-primary-500 overflow-hidden relative shadow-2xl shadow-primary-50">
               {fareResult === 'not_found' ? (
                 <p className="text-slate-400 font-bold text-sm">No specific fare data matches this criteria.</p>
               ) : (
                 <>
                  <span className="block text-[8px] font-black text-primary-400 uppercase tracking-[0.3em] mb-2">Estimated Total Fare</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-black text-white">₹{fareResult.amount}</span>
                    <span className="px-2 py-0.5 bg-white/10 text-primary-200 rounded text-[8px] font-black uppercase tracking-widest">{fareResult.class}</span>
                  </div>
                 </>
               )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-relaxed">
            Standard tariff data is not calibrated for this route.
          </p>
        </div>
      )}
    </div>
  );
};
export default FareCalculator;
