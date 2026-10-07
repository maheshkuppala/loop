import React, { useRef, useState } from 'react';
import { Upload, X, Star, AlertCircle, ImagePlus, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../common/Button';

// Sample high-quality community item photos for quick testing & instant preview
const QUICK_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?w=600&auto=format&fit=crop&q=80'
];

export const PhotoUploadZone = ({ images = [], onChange, maxImages = 6, error }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  const handleFiles = (files) => {
    setUploadError('');
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setUploadError(`Maximum of ${maxImages} photos allowed per listing.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newImages = [];

    for (const file of filesToProcess) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setUploadError(`"${file.name}" has an unsupported format. Please upload JPG, PNG, or WEBP.`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        setUploadError(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      // Convert to local preview data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e.target.result);
        if (newImages.length === filesToProcess.length) {
          onChange([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
    setUploadError('');
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const itemToPromote = images[index];
    const filtered = images.filter((_, idx) => idx !== index);
    onChange([itemToPromote, ...filtered]);
  };

  const handleMove = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const handleAddSample = () => {
    if (images.length >= maxImages) {
      setUploadError(`Maximum ${maxImages} images already attached.`);
      return;
    }
    const availableSamples = QUICK_SAMPLE_PHOTOS.filter((s) => !images.includes(s));
    const nextSample = availableSamples.length > 0 ? availableSamples[0] : QUICK_SAMPLE_PHOTOS[images.length % QUICK_SAMPLE_PHOTOS.length];
    onChange([...images, nextSample]);
    setUploadError('');
  };

  return (
    <div>
      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: dragOver
            ? '2px dashed #059669'
            : error || uploadError
            ? '2px dashed #ef4444'
            : '2px dashed var(--color-slate-300)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: dragOver ? '#ecfdf5' : '#f8fafc',
          padding: '1.75rem 1.25rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          position: 'relative'
        }}
        className="photo-dropzone-box"
        role="button"
        tabIndex={0}
        aria-label="Upload item photos"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          id="photo-file-input"
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: dragOver ? '#d1fae5' : '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: dragOver ? '#059669' : 'var(--color-slate-600)'
            }}
          >
            <Upload size={22} />
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-slate-800)' }}>
              Drag and drop photos here, or <span style={{ color: '#059669', textDecoration: 'underline' }}>browse</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '3px' }}>
              JPG, JPEG, PNG, WEBP &bull; Max 5MB each &bull; 1 to {maxImages} images
            </p>
          </div>
        </div>
      </div>

      {/* Quick Sample Button for frictionless user testing */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
          {images.length} of {maxImages} photos uploaded
        </span>
        {images.length < maxImages && (
          <button
            type="button"
            onClick={handleAddSample}
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              transition: 'background var(--transition-fast)'
            }}
            className="add-sample-btn"
          >
            <Sparkles size={12} />
            <span>Use demo photo</span>
          </button>
        )}
      </div>

      {/* Upload / Validation Error Banner */}
      {(uploadError || error) && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          role="alert"
        >
          <AlertCircle size={15} flexShrink={0} />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Uploaded Photos Cards Grid */}
      {images.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px',
            marginTop: '14px'
          }}
        >
          {images.map((img, idx) => {
            const isPrimary = idx === 0;
            return (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: isPrimary ? '2px solid #059669' : '1px solid var(--color-slate-200)',
                  backgroundColor: '#ffffff',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Image Display */}
                <div style={{ height: '110px', position: 'relative', backgroundColor: '#f1f5f9' }}>
                  <img
                    src={img}
                    alt={`Uploaded photo ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Primary Badge */}
                  {isPrimary ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        backgroundColor: 'rgba(5, 150, 105, 0.92)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}
                    >
                      <Star size={10} fill="#ffffff" />
                      <span>Primary Photo</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      title="Set as primary photo"
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      className="make-primary-btn"
                    >
                      <Star size={10} />
                      <span>Set Primary</span>
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    aria-label={`Remove image ${idx + 1}`}
                    title={`Remove image ${idx + 1}`}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)'
                    }}
                    className="remove-img-btn"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Reorder Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid var(--color-slate-100)',
                    fontSize: '0.7rem',
                    color: 'var(--color-slate-500)'
                  }}
                >
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, idx - 1)}
                    aria-label={`Move photo ${idx + 1} left`}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      opacity: idx === 0 ? 0.3 : 1,
                      color: 'var(--color-slate-600)',
                      padding: '2px'
                    }}
                  >
                    <ArrowLeft size={13} />
                  </button>

                  <span style={{ fontWeight: 600 }}>#{idx + 1}</span>

                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, idx + 1)}
                    aria-label={`Move photo ${idx + 1} right`}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: idx === images.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: idx === images.length - 1 ? 0.3 : 1,
                      color: 'var(--color-slate-600)',
                      padding: '2px'
                    }}
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .photo-dropzone-box:hover {
          border-color: #059669 !important;
          background-color: #ecfdf5 !important;
        }
        .remove-img-btn:hover {
          background-color: #ef4444 !important;
        }
        .make-primary-btn:hover {
          background-color: #059669 !important;
        }
        .add-sample-btn:hover {
          background-color: #ecfdf5 !important;
        }
      `}</style>
    </div>
  );
};

export default PhotoUploadZone;
