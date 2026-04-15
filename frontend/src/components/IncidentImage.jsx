import { useState, useEffect } from 'react';
import {  getIncidentImage  } from '../api';

const IncidentImage = ({ incidentId, FallbackIcon, color, onPreview }) => {
  const [imgData, setImgData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getIncidentImage(incidentId)
      .then((res) => {
        if (active) {
          setImgData(res.data?.data?.img || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [incidentId]);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center skeleton">
        <FallbackIcon size={32} style={{ color: '#cbd5e1' }} />
      </div>
    );
  }

  if (imgData) {
    return (
      <img
        src={imgData}
        alt="Incident evidence"
        className="w-full h-48 object-cover object-center cursor-zoom-in hover:opacity-90 transition-opacity"
        onClick={() => onPreview && onPreview(imgData)}
      />
    );
  }

  return (
    <div className="h-32 flex items-center justify-center opacity-50 bg-slate-50" style={{ color }}>
      <FallbackIcon size={32} />
    </div>
  );
};

export default IncidentImage;
