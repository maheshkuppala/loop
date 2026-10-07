import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  Package,
  Layers
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminTable from '../../components/admin/AdminTable';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Spinner from '../../components/common/Spinner';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FolderTree',
    subcategories: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Status Toggle Dialog State
  const [toggleCategoryTarget, setToggleCategoryTarget] = useState(null);
  const [isToggleLoading, setIsToggleLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getCategories();
      if (res?.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setNotification({ type: 'error', message: 'Failed to retrieve categories from database.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', description: '', icon: 'FolderTree', subcategories: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setIsEditing(true);
    setEditId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'FolderTree',
      subcategories: (cat.subcategories || []).join(', ')
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError('Category name must be at least 2 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      const subcats = formData.subcategories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim() || 'FolderTree',
        subcategories: subcats
      };

      if (isEditing) {
        await adminService.updateCategory(editId, payload);
        setNotification({ type: 'success', message: 'Category updated successfully.' });
      } else {
        await adminService.createCategory(payload);
        setNotification({ type: 'success', message: 'Category created successfully.' });
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setFormError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!toggleCategoryTarget) return;
    const targetStatus = toggleCategoryTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setIsToggleLoading(true);
      await adminService.toggleCategoryStatus(toggleCategoryTarget._id, targetStatus);
      setNotification({
        type: 'success',
        message: `Category ${toggleCategoryTarget.name} has been set to ${targetStatus}.`
      });
      setToggleCategoryTarget(null);
      fetchCategories();
    } catch (err) {
      console.error('Error toggling category status:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update category status.'
      });
    } finally {
      setIsToggleLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Category Name',
      accessor: 'name',
      render: (cat) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{cat.name}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
            slug: {cat.slug}
          </span>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (cat) => (
        <span style={{ color: '#94a3b8', fontSize: '0.8rem', maxWidth: '300px', display: 'block' }}>
          {cat.description || 'No description'}
        </span>
      )
    },
    {
      header: 'Subcategories',
      render: (cat) => (
        <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
          {cat.subcategories?.length || 0} subcategories
        </span>
      )
    },
    {
      header: 'Circulating Items',
      accessor: 'itemCount',
      render: (cat) => (
        <span
          style={{
            fontWeight: 600,
            color: cat.itemCount > 0 ? '#38bdf8' : '#64748b',
            fontSize: '0.85rem'
          }}
        >
          {cat.itemCount || 0} items
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (cat) => <StatusBadge status={cat.status || 'ACTIVE'} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (cat) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleOpenEdit(cat)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              backgroundColor: '#334155',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              color: '#f8fafc',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setToggleCategoryTarget(cat)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              backgroundColor: cat.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: '1px solid ' + (cat.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'),
              borderRadius: 'var(--radius-xs)',
              color: cat.status === 'ACTIVE' ? '#f87171' : '#34d399',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span>{cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
            Category Taxonomy & Governance
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Manage circular exchange categories, subcategories, and non-destructive active states.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: 'var(--color-primary-600)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {notification && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${notification.type === 'error' ? 'var(--color-danger)' : '#10b981'}`,
            borderRadius: 'var(--radius-sm)',
            color: notification.type === 'error' ? '#f87171' : '#34d399',
            fontSize: '0.85rem'
          }}
        >
          {notification.message}
        </div>
      )}

      <AdminFilterBar
        onReset={() => setSearch('')}
        hasActiveFilters={Boolean(search)}
      >
        <AdminSearch
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Search categories..."
        />
      </AdminFilterBar>

      <AdminTable
        columns={columns}
        data={filteredCategories}
        isLoading={isLoading}
        emptyMessage="No categories match your search."
      />

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '520px',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 16px 0' }}>
              {isEditing ? 'Edit Category' : 'Create New Category'}
            </h2>

            {formError && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-xs)',
                  color: '#f87171',
                  fontSize: '0.8rem',
                  marginBottom: '14px'
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Musical Instruments"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of items covered by this category..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Subcategories (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.subcategories}
                  onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                  placeholder="Guitars, Keyboards, Drums, Violins, Other"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#334155',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    backgroundColor: 'var(--color-primary-600)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting && <Spinner size="sm" />}
                  <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Non-Destructive Status Toggle Dialog */}
      <ConfirmDialog
        isOpen={Boolean(toggleCategoryTarget)}
        title={
          toggleCategoryTarget?.status === 'ACTIVE'
            ? `Deactivate category "${toggleCategoryTarget?.name}"?`
            : `Activate category "${toggleCategoryTarget?.name}"?`
        }
        message={
          toggleCategoryTarget?.status === 'ACTIVE'
            ? `Deactivating will hide "${toggleCategoryTarget?.name}" from new item submissions while safely preserving all historical items and requests under this category.`
            : `Activating will make "${toggleCategoryTarget?.name}" available for new community listings.`
        }
        confirmLabel={toggleCategoryTarget?.status === 'ACTIVE' ? 'Deactivate Category' : 'Activate Category'}
        confirmVariant={toggleCategoryTarget?.status === 'ACTIVE' ? 'warning' : 'primary'}
        isLoading={isToggleLoading}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setToggleCategoryTarget(null)}
      />
    </div>
  );
};

export default AdminCategoriesPage;
