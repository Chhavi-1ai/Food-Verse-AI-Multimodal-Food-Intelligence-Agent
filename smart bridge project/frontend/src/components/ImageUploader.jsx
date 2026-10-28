import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

export default function ImageUploader({
  onImageSelected,
  selectedFile,
  previewUrl,
  onClear,
  maxSizeMb = 10,
  label = 'Upload Food or Kitchen Image',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const validateAndPass = (file) => {
    setError(null);
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are supported.');
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File size exceeds maximum allowed limit of ${maxSizeMb} MB.`);
      return;
    }

    onImageSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  return (
    <div style={{ width: '100%', marginBottom: '16px' }}>
      {label && (
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
          {label}
        </label>
      )}

      {previewUrl ? (
        <div
          style={{
            position: 'relative',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '2px solid #22c55e',
            backgroundColor: '#f8fafc',
            maxHeight: '340px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: '100%', maxHeight: '340px', objectFit: 'contain' }}
          />
          <button
            type="button"
            onClick={onClear}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.2s',
            }}
            title="Remove image"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#16a34a' : '#cbd5e1'}`,
            borderRadius: '14px',
            padding: '36px 20px',
            textAlign: 'center',
            backgroundColor: isDragging ? '#f0fdf4' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          className="upload-dropzone"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '999px',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <UploadCloud size={28} />
          </div>
          <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#1e293b', fontSize: '0.98rem' }}>
            Click to upload or drag & drop image
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
            Supports JPEG, PNG, or WebP (max {maxSizeMb} MB)
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            color: '#dc2626',
            fontSize: '0.84rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

