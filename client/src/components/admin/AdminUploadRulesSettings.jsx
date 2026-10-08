import React, { useState, useEffect } from 'react';
import {
  Sliders, Save, CheckCircle2, AlertCircle, ShieldCheck,
  FileText, Image, Camera, HardDrive, Lock
} from 'lucide-react';
import axios from 'axios';

export default function AdminUploadRulesSettings() {
  const [rules, setRules] = useState({
    minImages: 1,
    maxImages: 8,
    maxFileSizeMb: 10,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    allowedDocFormats: ['pdf'],
    pdfAllowed: true,
    galleryAllowed: true,
    deviceFileAllowed: true,
    cameraAllowed: true,
    requiredTitle: true,
    requiredCategory: true,
    requiredCondition: true,
    requiredDescription: true,
    requiredLocation: true,
    requiredPrimaryImage: true,
    requiredSpecifications: false,
    customerUploadAllowed: true,
    customerApprovalRequired: true,
    adminAutoPublish: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/upload-rules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success && res.data?.rules) {
        setRules(res.data.rules);
      }
    } catch (err) {
      console.error('Error loading admin upload rules:', err);
      setError('Failed to load current upload rules from database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (field) => {
    setRules((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setRules((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormatToggle = (format) => {
    setRules((prev) => {
      const current = prev.allowedFormats || [];
      const updated = current.includes(format)
        ? current.filter((f) => f !== format)
        : [...current, format];
      return { ...prev, allowedFormats: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/admin/upload-rules', rules, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setMessage('Product upload rules & moderation policies updated successfully!');
        if (res.data.rules) setRules(res.data.rules);
      }
    } catch (err) {
      console.error('Error saving upload rules:', err);
      setError(err.response?.data?.message || 'Failed to save product upload rules.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Sliders className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-400" />
        <p className="text-sm">Loading product upload rules configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Product Upload & Moderation Rules</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure global controls for product photos, allowed file types, size limits, and customer submission approval workflows.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Rules...' : 'Save Configuration'}
        </button>
      </div>

      {/* Toast Feedback */}
      {message && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Media Upload Limits & Size */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Image className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Photo & File Size Limits</h3>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Minimum Product Photos Required:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rules.minImages}
                onChange={(e) => handleChange('minImages', parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Maximum Product Photos Allowed:
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={rules.maxImages}
                onChange={(e) => handleChange('maxImages', parseInt(e.target.value, 10) || 8)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Maximum Image File Size (MB per photo):
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={rules.maxFileSizeMb}
                onChange={(e) => handleChange('maxFileSizeMb', parseInt(e.target.value, 10) || 10)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Allowed Image Formats:
              </label>
              <div className="flex flex-wrap gap-2">
                {['jpg', 'jpeg', 'png', 'webp'].map((fmt) => (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => handleFormatToggle(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                      rules.allowedFormats.includes(fmt)
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    .{fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Upload Sources & Input Options */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Allowed Media Input Sources</h3>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Device File Upload</span>
              <button
                type="button"
                onClick={() => handleToggle('deviceFileAllowed')}
                className={`w-12 h-6 rounded-full transition p-1 ${rules.deviceFileAllowed ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-950 transition ${rules.deviceFileAllowed ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Mobile Camera Capture</span>
              <button
                type="button"
                onClick={() => handleToggle('cameraAllowed')}
                className={`w-12 h-6 rounded-full transition p-1 ${rules.cameraAllowed ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-950 transition ${rules.cameraAllowed ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Device Photo Gallery</span>
              <button
                type="button"
                onClick={() => handleToggle('galleryAllowed')}
                className={`w-12 h-6 rounded-full transition p-1 ${rules.galleryAllowed ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-950 transition ${rules.galleryAllowed ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">PDF Document Page Extraction</span>
              <button
                type="button"
                onClick={() => handleToggle('pdfAllowed')}
                className={`w-12 h-6 rounded-full transition p-1 ${rules.pdfAllowed ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-950 transition ${rules.pdfAllowed ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Customer Upload Permissions & Moderation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Approval & Moderation Workflow</h3>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-200 font-semibold block">Allow Customers to Upload Products</span>
                <span className="text-[11px] text-slate-400 block">Enables product creation forms for community members</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('customerUploadAllowed')}
                className={`w-12 h-6 rounded-full transition p-1 shrink-0 ${rules.customerUploadAllowed ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-950 transition ${rules.customerUploadAllowed ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-200 font-semibold block">Customer Products Require Admin Approval</span>
                <span className="text-[11px] text-slate-400 block">Customer uploads stay PENDING until admin approves</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('customerApprovalRequired')}
                className={`w-12 h-6 rounded-full transition p-1 shrink-0 ${rules.customerApprovalRequired ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-950 transition ${rules.customerApprovalRequired ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-200 font-semibold block">Admin Products Auto-Publish Immediately</span>
                <span className="text-[11px] text-slate-400 block">Listings published by Admin bypass approval phase</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('adminAutoPublish')}
                className={`w-12 h-6 rounded-full transition p-1 shrink-0 ${rules.adminAutoPublish ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-950 transition ${rules.adminAutoPublish ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Required Field Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Required Field Validation Rules</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {[
              { key: 'requiredTitle', label: 'Product Title' },
              { key: 'requiredCategory', label: 'Category Selection' },
              { key: 'requiredCondition', label: 'Condition Grade' },
              { key: 'requiredDescription', label: 'Description Text' },
              { key: 'requiredLocation', label: 'Product Location' },
              { key: 'requiredPrimaryImage', label: 'Primary Cover Image' },
              { key: 'requiredSpecifications', label: 'Specifications Array' }
            ].map((item) => (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  rules[item.key]
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <span className="text-xs font-medium">{item.label}</span>
                <CheckCircle2 className={`w-4 h-4 ${rules[item.key] ? 'text-emerald-400' : 'text-slate-700'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
