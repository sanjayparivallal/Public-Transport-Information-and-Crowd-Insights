import { useEffect, useMemo, useState } from 'react';
import { SearchIcon, MapIcon } from '../../components/icons';

const FareCalculator = ({ fareTable }) => {
  const [fareFrom, setFareFrom] = useState('');
  const [fareTo, setFareTo] = useState('');
  const [fareResult, setFareResult] = useState(null);
  const [fareClass, setFareClass] = useState('');

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
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-10 mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <MapIcon size={100} />
      </div>

      <div className="flex items-center text-xl font-black tracking-tight text-slate-800 mb-8 pb-5 border-b-2 border-slate-100 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4 shadow-sm border border-blue-100">
          <SearchIcon size={20} />
        </div>
        Fare Estimation
      </div>

      {fareTable?.length > 0 ? (
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 gap-5">
            <div className="relative">
              <input
                type="text"
                list="fare-stops"
                id="fare_from"
                className="block px-5 pb-3 pt-6 w-full text-sm font-bold text-slate-900 bg-white rounded-2xl border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer transition-colors hover:border-slate-300 shadow-sm"
                placeholder=" "
                value={fareFrom}
                onChange={e => { setFareFrom(e.target.value); setFareResult(null); }}
              />
              <label htmlFor="fare_from" className="absolute text-[10px] font-black uppercase tracking-widest text-slate-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:start-3 peer-focus:scale-75 peer-focus:-translate-y-4 start-3 pointer-events-none">Origin Stop</label>
            </div>

            <div className="relative">
              <input
                type="text"
                list="fare-stops"
                id="fare_to"
                className="block px-5 pb-3 pt-6 w-full text-sm font-bold text-slate-900 bg-white rounded-2xl border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer transition-colors hover:border-slate-300 shadow-sm"
                placeholder=" "
                value={fareTo}
                onChange={e => { setFareTo(e.target.value); setFareResult(null); }}
              />
              <label htmlFor="fare_to" className="absolute text-[10px] font-black uppercase tracking-widest text-slate-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:start-3 peer-focus:scale-75 peer-focus:-translate-y-4 start-3 pointer-events-none">Destination</label>
            </div>

            <div className="relative">
              <select
                id="fare_class"
                className="block px-5 pb-3 pt-6 w-full text-sm font-bold text-slate-900 bg-white rounded-2xl border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer transition-colors hover:border-slate-300 shadow-sm"
                value={fareClass}
                onChange={e => { setFareClass(e.target.value); setFareResult(null); }}
                disabled={!availableClasses.length}
              >
                {!availableClasses.length ? (
                  <option value="">No class available</option>
                ) : (
                  availableClasses.map((c) => (
                    <option key={c} value={c} className="font-bold">{classLabel[c] || c}</option>
                  ))
                )}
              </select>
              <label htmlFor="fare_class" className="absolute text-[10px] font-black uppercase tracking-widest text-slate-500 duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] bg-white px-2 start-3 pointer-events-none">Travel Class</label>

              {fareFrom && fareTo && !pairFares.length && (
                <p className="absolute -bottom-5 left-2 text-[9px] font-bold text-rose-500 uppercase tracking-wider">
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
            className="w-full mt-4 inline-flex items-center justify-center px-6 py-4 font-black tracking-widest uppercase text-xs rounded-2xl 
  border-2 border-blue-600 text-blue-600 bg-transparent 
  hover:bg-blue-600 hover:text-white 
  transition-all duration-300 
  shadow-sm hover:shadow-lg hover:shadow-blue-500/30 
  active:scale-95 
  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600 
  group"
            onClick={handleFareCalc}
            disabled={!fareFrom || !fareTo || !fareClass || (fareFrom && fareTo && !pairFares.length)}
          >
            Calculate Fare
          </button>
          {fareResult && (
            <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative shadow-sm">
              {fareResult === 'not_found' ? (
                <p className="text-slate-500 font-bold text-sm relative z-10">No specific fare data matches this criteria.</p>
              ) : (
                <div className="flex flex-col items-center justify-center relative z-10">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Total Fare</span>
                  <div className="flex items-end justify-center gap-3">
                    <span className="text-4xl font-black text-slate-800 tracking-tight leading-none">₹{Number(fareResult.amount).toFixed(1)}</span>
                    <span className="mb-1 px-2.5 py-0.5 bg-white text-slate-600 rounded-md border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-sm">{fareResult.class}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-slate-50/80 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-relaxed">
            Standard tariff data is not calibrated for this route.
          </p>
        </div>
      )}
    </div>
  );
};

export default FareCalculator;

