import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  Package,
  Layers,
  Eye,
  Trash2,
  Tag,
  AlertTriangle,
  FileText,
  Clock,
  HelpCircle,
  X
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminTable from '../../components/admin/AdminTable';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminPagination from '../../components/admin/AdminPagination';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Spinner from '../../components/common/Spinner';

export const AdminCategoriesPage = () => {
  // Main Data States
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalSubcategories: 0,
    categoriesInUse: 0,
    unusedCategories: 0
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Inspector Modal State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Create / Edit Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'FolderTree',
    status: 'ACTIVE',
    subcategories: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Subcategory Manager Modal State
  const [subcatModalCategory, setSubcatModalCategory] = useState(null);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [editingSubcatIndex, setEditingSubcatIndex] = useState(null);
  const [editingSubcatName, setEditingSubcatName] = useState('');
  const [isSubcatLoading, setIsSubcatLoading] = useState(false);
  const [subcatError, setSubcatError] = useState('');

  // Status Toggle Dialog State
  const [toggleTarget, setToggleTarget] = useState(null);
  const [isToggleLoading, setIsToggleLoading] = useState(false);

  // Safe Deletion Modal & Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Fetch Categories & Real-time Stats
  const fetchCategoriesData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getCategories({
        page,
        limit,
        search,
        status: statusFilter
      });
      if (res?.success) {
        setCategories(res.data || []);
        if (res.pagination) {
          setTotal(res.pagination.total || 0);
          setTotalPages(res.pagination.totalPages || 1);
        }
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setNotification({ type: 'error', message: 'Failed to retrieve categories from database.' });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  // Fetch Category Stats standalone on load
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminService.getCategoryStats();
      if (res?.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load category stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesData();
    fetchStats();
  }, [fetchCategoriesData, fetchStats]);

  // Handle Search Input Change
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  // Handle Status Filter Change
  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  // Inspect Category Details
  const handleOpenDetails = async (cat) => {
    try {
      setIsDetailsLoading(true);
      setIsDetailsOpen(true);
      const res = await adminService.getCategoryDetails(cat.id || cat._id);
      if (res?.success) {
        setSelectedCategory(res.data);
      } else {
        setSelectedCategory(cat);
      }
    } catch (err) {
      console.error('Error fetching category details:', err);
      setSelectedCategory(cat);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // Open Create Category Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'FolderTree',
      status: 'ACTIVE',
      subcategories: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEdit = (cat) => {
    setIsEditing(true);
    setEditId(cat.id || cat._id);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      icon: cat.icon || 'FolderTree',
      status: cat.status || 'ACTIVE',
      subcategories: Array.isArray(cat.subcategories) ? cat.subcategories.join(', ') : ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Category (Create or Edit)
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
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim(),
        icon: formData.icon.trim() || 'FolderTree',
        status: formData.status,
        subcategories: subcats
      };

      if (isEditing) {
        await adminService.updateCategory(editId, payload);
        setNotification({ type: 'success', message: `Category "${payload.name}" updated successfully.` });
      } else {
        await adminService.createCategory(payload);
        setNotification({ type: 'success', message: `Category "${payload.name}" created successfully.` });
      }

      setIsModalOpen(false);
      fetchCategoriesData();
      fetchStats();
    } catch (err) {
      console.error('Error saving category:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save category.';
      setFormError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Toggle Status
  const handleConfirmToggleStatus = async () => {
    if (!toggleTarget) return;
    const targetStatus = toggleTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setIsToggleLoading(true);
      await adminService.toggleCategoryStatus(toggleTarget.id || toggleTarget._id, targetStatus);
      setNotification({
        type: 'success',
        message: `Category "${toggleTarget.name}" status set to ${targetStatus}.`
      });
      setToggleTarget(null);
      fetchCategoriesData();
      fetchStats();
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

  // Attempt Delete Category with Referential Integrity Protection
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleteLoading(true);
      setDeleteWarning(null);
      await adminService.deleteCategory(deleteTarget.id || deleteTarget._id);
      setNotification({
        type: 'success',
        message: `Category "${deleteTarget.name}" deleted successfully.`
      });
      setDeleteTarget(null);
      fetchCategoriesData();
      fetchStats();
    } catch (err) {
      console.error('Error deleting category:', err);
      const statusCode = err.response?.status;
      const errMsg = err.response?.data?.message || 'Failed to delete category.';
      if (statusCode === 409) {
        // Safe Deletion Blocked - Referential Integrity Enforced
        setDeleteWarning({
          categoryName: deleteTarget.name,
          message: errMsg,
          itemCount: deleteTarget.itemCount || deleteTarget.item_count || 0,
          wantedItemCount: deleteTarget.wantedItemCount || deleteTarget.wanted_item_count || 0
        });
        setDeleteTarget(null);
      } else {
        setNotification({
          type: 'error',
          message: errMsg
        });
        setDeleteTarget(null);
      }
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Subcategory Actions (Add, Rename, Remove)
  const handleOpenSubcatManager = (cat) => {
    setSubcatModalCategory(cat);
    setNewSubcatName('');
    setEditingSubcatIndex(null);
    setEditingSubcatName('');
    setSubcatError('');
  };

  const handleAddSubcat = async () => {
    if (!newSubcatName.trim()) return;
    try {
      setIsSubcatLoading(true);
      setSubcatError('');
      const res = await adminService.manageSubcategory(subcatModalCategory.id || subcatModalCategory._id, {
        action: 'ADD',
        subcategoryName: newSubcatName.trim()
      });
      if (res?.success && res.data) {
        setSubcatModalCategory(res.data);
        setNewSubcatName('');
        fetchCategoriesData();
        fetchStats();
      }
    } catch (err) {
      setSubcatError(err.response?.data?.message || 'Failed to add subcategory.');
    } finally {
      setIsSubcatLoading(false);
    }
  };

  const handleRenameSubcat = async (oldName) => {
    if (!editingSubcatName.trim()) return;
    try {
      setIsSubcatLoading(true);
      setSubcatError('');
      const res = await adminService.manageSubcategory(subcatModalCategory.id || subcatModalCategory._id, {
        action: 'RENAME',
        subcategoryName: editingSubcatName.trim(),
        oldSubcategoryName: oldName
      });
      if (res?.success && res.data) {
        setSubcatModalCategory(res.data);
        setEditingSubcatIndex(null);
        setEditingSubcatName('');
        fetchCategoriesData();
        fetchStats();
      }
    } catch (err) {
      setSubcatError(err.response?.data?.message || 'Failed to rename subcategory.');
    } finally {
      setIsSubcatLoading(false);
    }
  };

  const handleRemoveSubcat = async (subName) => {
    try {
      setIsSubcatLoading(true);
      setSubcatError('');
      const res = await adminService.manageSubcategory(subcatModalCategory.id || subcatModalCategory._id, {
        action: 'REMOVE',
        subcategoryName: subName
      });
      if (res?.success && res.data) {
        setSubcatModalCategory(res.data);
        fetchCategoriesData();
        fetchStats();
      }
    } catch (err) {
      setSubcatError(err.response?.data?.message || 'Failed to remove subcategory.');
    } finally {
      setIsSubcatLoading(false);
    }
  };

  // Table Columns Definition
  const columns = [
    {
      header: 'Category & Slug',
      accessor: 'name',
      render: (cat) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}
          >
            <FolderTree size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{cat.name}</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
              slug: {cat.slug}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (cat) => (
        <span
          style={{
            color: '#94a3b8',
            fontSize: '0.8rem',
            maxWidth: '260px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {cat.description || 'No description available'}
        </span>
      )
    },
    {
      header: 'Subcategories',
      render: (cat) => {
        const subCount = Array.isArray(cat.subcategories) ? cat.subcategories.length : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: subCount > 0 ? 'rgba(168, 85, 247, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                color: subCount > 0 ? '#c084fc' : '#64748b',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {subCount} subcategories
            </span>
            <button
              type="button"
              onClick={() => handleOpenSubcatManager(cat)}
              title="Manage subcategories"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px 4px'
              }}
            >
              <Tag size={14} />
            </button>
          </div>
        );
      }
    },
    {
      header: 'Item Usage',
      accessor: 'itemCount',
      render: (cat) => {
        const itemCount = cat.itemCount || cat.item_count || 0;
        const wantedCount = cat.wantedItemCount || cat.wanted_item_count || 0;
        const inUse = itemCount > 0 || wantedCount > 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontWeight: 600,
                color: inUse ? '#38bdf8' : '#64748b',
                fontSize: '0.85rem'
              }}
            >
              {itemCount} listings
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {wantedCount} wanted requests
            </span>
          </div>
        );
      }
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleOpenDetails(cat)}
            title="Inspect Details"
            style={{
              padding: '6px 8px',
              backgroundColor: '#334155',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              color: '#f8fafc',
              cursor: 'pointer'
            }}
          >
            <Eye size={14} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEdit(cat)}
            title="Edit Category"
            style={{
              padding: '6px 8px',
              backgroundColor: '#334155',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              color: '#f8fafc',
              cursor: 'pointer'
            }}
          >
            <Edit2 size={14} />
          </button>

          <button
            type="button"
            onClick={() => setToggleTarget(cat)}
            style={{
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
            {cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>

          <button
            type="button"
            onClick={() => setDeleteTarget(cat)}
            title="Delete Category"
            style={{
              padding: '6px 8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-xs)',
              color: '#f87171',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
            Categories Taxonomy & Governance
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Manage circular exchange categories, subcategories, referential integrity, and usage statistics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
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

      {/* Real-time Category Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <AdminStatCard
          title="Total Categories"
          value={stats.total}
          icon={FolderTree}
          color="blue"
        />
        <AdminStatCard
          title="Active Categories"
          value={stats.active}
          icon={CheckCircle}
          color="emerald"
        />
        <AdminStatCard
          title="Inactive Categories"
          value={stats.inactive}
          icon={XCircle}
          color="rose"
        />
        <AdminStatCard
          title="Total Subcategories"
          value={stats.totalSubcategories}
          icon={Layers}
          color="purple"
        />
        <AdminStatCard
          title="Categories In Use"
          value={stats.categoriesInUse}
          icon={Package}
          color="amber"
        />
      </div>

      {/* Global Notification Banner */}
      {notification && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${notification.type === 'error' ? 'var(--color-danger)' : '#10b981'}`,
            borderRadius: 'var(--radius-sm)',
            color: notification.type === 'error' ? '#f87171' : '#34d399',
            fontSize: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <AdminFilterBar
        onReset={() => {
          setSearch('');
          setStatusFilter('');
          setPage(1);
        }}
        hasActiveFilters={Boolean(search || statusFilter)}
      >
        <AdminSearch
          value={search}
          onChange={handleSearchChange}
          placeholder="Search categories, slugs, descriptions..."
        />

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 'var(--radius-sm)',
            color: '#f8fafc',
            fontSize: '0.875rem'
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </AdminFilterBar>

      {/* Categories Data Table */}
      <AdminTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="No categories match your search filters."
      />

      {/* Server-Side Pagination */}
      {totalPages > 1 && (
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          totalItems={total}
          itemsPerPage={limit}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Category Details Inspector */}
      {/* ------------------------------------------------------------- */}
      {isDetailsOpen && (
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
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Category Details Inspector
              </h2>
              <button
                onClick={() => setIsDetailsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {isDetailsLoading ? (
              <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                <Spinner size="lg" />
              </div>
            ) : selectedCategory ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#0f172a', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 4px 0' }}>
                      {selectedCategory.name}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
                      ID: {selectedCategory.id || selectedCategory._id} | Slug: {selectedCategory.slug}
                    </span>
                  </div>
                  <StatusBadge status={selectedCategory.status || 'ACTIVE'} />
                </div>

                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Description</h4>
                  <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0 }}>
                    {selectedCategory.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Circulating Listings</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0 0 0' }}>
                      {selectedCategory.itemCount || selectedCategory.item_count || 0} items
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Wanted Item Requests</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c084fc', margin: '4px 0 0 0' }}>
                      {selectedCategory.wantedItemCount || selectedCategory.wanted_item_count || 0} requests
                    </p>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                    Subcategories ({Array.isArray(selectedCategory.subcategories) ? selectedCategory.subcategories.length : 0})
                  </h4>
                  {Array.isArray(selectedCategory.subcategories) && selectedCategory.subcategories.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedCategory.subcategories.map((sub, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#334155',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '0.8rem'
                          }}
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>No subcategories configured.</span>
                  )}
                </div>

                {Array.isArray(selectedCategory.sampleItems) && selectedCategory.sampleItems.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                      Sample Related Items
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedCategory.sampleItems.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#0f172a',
                            borderRadius: 'var(--radius-xs)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem'
                          }}
                        >
                          <span style={{ color: '#f8fafc', fontWeight: 500 }}>{item.title}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{item.sharing_type || item.sharingType}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#334155',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Close Inspector
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Create / Edit Category Modal */}
      {/* ------------------------------------------------------------- */}
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
                  padding: '10px 14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-xs)',
                  color: '#f87171',
                  fontSize: '0.85rem',
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
                  Category Slug (Optional - auto-generated if left empty)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="musical-instruments"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: Subcategory Array Manager */}
      {/* ------------------------------------------------------------- */}
      {subcatModalCategory && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Manage Subcategories: {subcatModalCategory.name}
              </h2>
              <button
                onClick={() => setSubcatModalCategory(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {subcatError && (
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
                {subcatError}
              </div>
            )}

            {/* Add Subcategory Input */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={newSubcatName}
                onChange={(e) => setNewSubcatName(e.target.value)}
                placeholder="Enter new subcategory name..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 'var(--radius-sm)',
                  color: '#f8fafc',
                  fontSize: '0.875rem'
                }}
              />
              <button
                type="button"
                onClick={handleAddSubcat}
                disabled={isSubcatLoading || !newSubcatName.trim()}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--color-primary-600)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: isSubcatLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Add
              </button>
            </div>

            {/* Existing Subcategories List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {Array.isArray(subcatModalCategory.subcategories) && subcatModalCategory.subcategories.length > 0 ? (
                subcatModalCategory.subcategories.map((sub, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: '#0f172a',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid #334155'
                    }}
                  >
                    {editingSubcatIndex === idx ? (
                      <div style={{ display: 'flex', gap: '6px', flex: 1, marginRight: '8px' }}>
                        <input
                          type="text"
                          value={editingSubcatName}
                          onChange={(e) => setEditingSubcatName(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            backgroundColor: '#1e293b',
                            border: '1px solid #38bdf8',
                            borderRadius: '4px',
                            color: '#f8fafc',
                            fontSize: '0.85rem'
                          }}
                        />
                        <button
                          onClick={() => handleRenameSubcat(sub)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#10b981',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '0.75rem'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSubcatIndex(null)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#64748b',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '0.75rem'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ color: '#f8fafc', fontSize: '0.875rem' }}>{sub}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setEditingSubcatIndex(idx);
                              setEditingSubcatName(sub);
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#334155',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#cbd5e1',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => handleRemoveSubcat(sub)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#f87171',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No subcategories currently exist.</span>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSubcatModalCategory(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#334155',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: Safe Category Deletion Warning (Referential Integrity Block) */}
      {/* ------------------------------------------------------------- */}
      {deleteWarning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '500px',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171'
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Deletion Protected (Referential Integrity)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Category: "{deleteWarning.categoryName}"
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-xs)',
                color: '#f87171',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                marginBottom: '16px'
              }}
            >
              {deleteWarning.message}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '16px' }}>
              Deleting this category would orphan community listings. To maintain data integrity, please deactivate the category instead to prevent new item selections.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteWarning(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#334155',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Understand & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(toggleTarget)}
        title={
          toggleTarget?.status === 'ACTIVE'
            ? `Deactivate category "${toggleTarget?.name}"?`
            : `Activate category "${toggleTarget?.name}"?`
        }
        message={
          toggleTarget?.status === 'ACTIVE'
            ? `Deactivating will hide "${toggleTarget?.name}" from new item selections while safely preserving all existing community listings and transactions.`
            : `Activating will make "${toggleTarget?.name}" available for new community listings.`
        }
        confirmLabel={toggleTarget?.status === 'ACTIVE' ? 'Deactivate Category' : 'Activate Category'}
        confirmVariant={toggleTarget?.status === 'ACTIVE' ? 'warning' : 'primary'}
        isLoading={isToggleLoading}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setToggleTarget(null)}
      />

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete category "${deleteTarget?.name}"?`}
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? The system will verify if any items depend on it before deleting.`}
        confirmLabel="Delete Category"
        confirmVariant="danger"
        isLoading={isDeleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminCategoriesPage;
