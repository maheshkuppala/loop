import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Save,
  X,
  FileText
} from 'lucide-react';
import impactService from '../../services/impactService';
import Spinner from '../common/Spinner';

export const AdminImpactFactorsSection = () => {
  const [factors, setFactors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    metricType: 'CO2E_AVOIDED',
    value: '',
    unit: 'kg CO2e',
    basis: 'per item reused',
    source: '',
    methodologyVersion: '1.0',
    description: '',
    active: true
  });

  const loadFactors = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await impactService.getImpactFactors();
      if (res?.success) {
        setFactors(res.factors || []);
      }
    } catch (err) {
      console.error('Failed to load impact factors:', err);
      setError('Unable to load environmental impact factors.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const openCreateModal = () => {
    setEditingFactor(null);
    setFormData({
      category: '',
      metricType: 'CO2E_AVOIDED',
      value: '',
      unit: 'kg CO2e',
      basis: 'per item reused',
      source: '',
      methodologyVersion: '1.0',
      description: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (factor) => {
    setEditingFactor(factor);
    setFormData({
      category: factor.category,
      metricType: factor.metricType,
      value: factor.value,
      unit: factor.unit,
      basis: factor.basis || 'per item reused',
      source: factor.source,
      methodologyVersion: factor.methodologyVersion || '1.0',
      description: factor.description || '',
      active: factor.active
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (factor) => {
    try {
      const updatedActive = !factor.active;
      const res = await impactService.updateImpactFactor(factor._id, { active: updatedActive });
      if (res?.success) {
        setSuccessMsg(`Factor [${factor.category}] ${factor.metricType} is now ${updatedActive ? 'Active' : 'Deactivated'}.`);
        loadFactors();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to toggle factor active status:', err);
      setError(err.message || 'Failed to update factor.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');

      if (editingFactor) {
        // Update existing factor
        const res = await impactService.updateImpactFactor(editingFactor._id, formData);
        if (res?.success) {
          setSuccessMsg(`Impact factor updated (v${res.factor.factorVersion || 1}).`);
          setIsModalOpen(false);
          loadFactors();
        }
      } else {
        // Create new factor
        const res = await impactService.createImpactFactor(formData);
        if (res?.success) {
          setSuccessMsg('New verified impact factor created successfully.');
          setIsModalOpen(false);
          loadFactors();
        }
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving impact factor:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save impact factor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Environmental Impact Factors Governance
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Scientifically verified conversion factors applied to completed reuse transactions
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#059669',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          <span>Add Verified Factor</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: 'var(--radius-xs)', color: '#34d399', fontSize: '0.85rem' }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: 'var(--radius-xs)', color: '#f87171', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Factors Table */}
      {isLoading ? (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <Spinner size="md" />
        </div>
      ) : factors.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
          No impact factors configured yet. Click "Add Verified Factor" to configure the first benchmark factor.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px' }}>Metric</th>
                <th style={{ padding: '10px 12px' }}>Value & Unit</th>
                <th style={{ padding: '10px 12px' }}>Basis</th>
                <th style={{ padding: '10px 12px' }}>Documented Source</th>
                <th style={{ padding: '10px 12px' }}>Version</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {factors.map((f) => (
                <tr key={f._id} style={{ borderBottom: '1px solid #243247' }}>
                  <td style={{ padding: '12px', color: '#f8fafc', fontWeight: 700 }}>
                    {f.category}
                  </td>
                  <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 600 }}>
                    {f.metricType}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 800 }}>
                    {f.value} {f.unit}
                  </td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>
                    {f.basis || 'per item'}
                  </td>
                  <td style={{ padding: '12px', color: '#94a3b8', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.source}>
                    {f.source}
                  </td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>
                    v{f.factorVersion || 1} ({f.methodologyVersion || '1.0'})
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: f.active ? 'rgba(52, 211, 153, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                        color: f.active ? '#34d399' : '#94a3b8',
                        border: f.active ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)'
                      }}
                    >
                      {f.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(f)}
                        title="Edit factor details"
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#334155',
                          border: 'none',
                          borderRadius: 'var(--radius-xs)',
                          color: '#f8fafc',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(f)}
                        title={f.active ? 'Deactivate factor' : 'Activate factor'}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: f.active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          border: 'none',
                          borderRadius: 'var(--radius-xs)',
                          color: f.active ? '#f87171' : '#34d399',
                          cursor: 'pointer'
                        }}
                      >
                        {f.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create / Edit Factor */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {editingFactor ? 'Edit Impact Factor' : 'Configure New Verified Factor'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Books, Electronics, Clothing"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Metric Type *
                  </label>
                  <select
                    value={formData.metricType}
                    onChange={(e) => setFormData({ ...formData, metricType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff'
                    }}
                  >
                    <option value="CO2E_AVOIDED">CO2E_AVOIDED</option>
                    <option value="WASTE_AVOIDED">WASTE_AVOIDED</option>
                    <option value="WATER_SAVED">WATER_SAVED</option>
                    <option value="REUSE_COUNT">REUSE_COUNT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Factor Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 1.3"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kg CO2e, kg waste, liters"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Documented Scientific / Organizational Source *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WRAP UK Circular Economy Research (2023)"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid #475569',
                    backgroundColor: '#0f172a',
                    color: '#ffffff'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Calculation Basis
                  </label>
                  <input
                    type="text"
                    value={formData.basis}
                    onChange={(e) => setFormData({ ...formData, basis: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Methodology Version
                  </label>
                  <input
                    type="text"
                    value={formData.methodologyVersion}
                    onChange={(e) => setFormData({ ...formData, methodologyVersion: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Technical Description & Scope Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Lifecycle boundaries, deferred virgin production scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid #475569',
                    backgroundColor: '#0f172a',
                    color: '#ffffff'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="activeFactorCheckbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                />
                <label htmlFor="activeFactorCheckbox" style={{ fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  Set factor active immediately for qualifying completed transactions
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Saving...' : editingFactor ? 'Save Updates' : 'Create Factor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImpactFactorsSection;
