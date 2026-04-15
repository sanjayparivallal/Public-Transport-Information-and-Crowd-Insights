import { useEffect, useMemo, useState } from 'react';
import SearchableCombobox from '../../components/SearchableCombobox';
import { SearchIcon, MapIcon } from '../../components/icons';

const FareCalculator = ({ fareTable, amenities = [] }) => {
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
    const classes = [];
    const amStr = (amenities || []).join(' ').toLowerCase();
    const hasAC = amStr.includes('ac');
    const hasSleeper = amStr.includes('sleeper');
    
    if (amStr.includes('general') || (!hasAC && !hasSleeper)) {
        classes.push('general');
    }
    if (hasAC) classes.push('AC');
    if (hasSleeper) classes.push('sleeper');
    
    return classes;
  }, [amenities]);

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

  const classOptions = availableClasses.map((c) => ({
    label: classLabel[c] || c,
    value: c,
  }));

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
        <div className="space-y-5 relative z-10">
          {/* Origin Stop */}
          <SearchableCombobox
            id="fare_from"
            label="Origin Stop"
            options={stopSuggestions}
            value={fareFrom}
            onChange={(v) => { setFareFrom(v); setFareResult(null); }}
            placeholder="e.g. Salem"
            allowCustom
          />

          {/* Destination Stop */}
          <SearchableCombobox
            id="fare_to"
            label="Destination Stop"
            options={stopSuggestions}
            value={fareTo}
            onChange={(v) => { setFareTo(v); setFareResult(null); }}
            placeholder="e.g. Chennai"
            allowCustom
          />

          {/* Travel Class */}
          <div>
            <SearchableCombobox
              id="fare_class"
              label="Travel Class"
              options={classOptions}
              value={fareClass}
              onChange={(v) => { setFareClass(v); setFareResult(null); }}
              placeholder="Select class…"
              allowCustom={false}
              disabled={!availableClasses.length}
            />
            {fareFrom && fareTo && !pairFares.length && (
              <p className="mt-1.5 ml-1 text-[9px] font-bold text-rose-500 uppercase tracking-wider">
                No fare entries available for this stop pair.
              </p>
            )}
          </div>

          <button
            className="w-full mt-2 inline-flex items-center justify-center px-6 py-4 font-black tracking-widest uppercase text-xs rounded-2xl border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600"
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
