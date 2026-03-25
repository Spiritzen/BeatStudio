import { useRef } from 'react';
import './SampleLoader.css';

interface SampleLoaderProps {
  sampleName?: string;
  onLoad: (url: string, name: string) => void;
}

export function SampleLoader({ sampleName, onLoad }: SampleLoaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onLoad(url, file.name);
    e.target.value = '';
  };

  return (
    <div className="sample-loader">
      <button className="btn-upload" onClick={() => fileInputRef.current?.click()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17,8 12,3 7,8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Upload sample
      </button>
      {sampleName && (
        <div className="sample-name">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          <span title={sampleName}>{sampleName}</span>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".wav,.mp3,.ogg"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}
