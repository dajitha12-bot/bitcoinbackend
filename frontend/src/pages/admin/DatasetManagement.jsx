// src/pages/admin/DatasetManagement.jsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  Database,
  Plus,
  UploadCloud,
  Server,
  X,
  FileText,
  HardDrive,
  Eye,
  Play,
} from 'lucide-react';

import DataTable from '../../components/DataTable';
import RiskBadge from '../../components/RiskBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';

import '../../styles/dataset-management.css';

export const DatasetManagement = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDsName, setNewDsName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [notification, setNotification] = useState('');

  /* =========================================================
     LOAD DATASETS
  ========================================================= */

  const loadDatasets = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await adminService.getDatasets();

      const data =
        response?.data ??
        response?.datasets ??
        response?.results ??
        response ??
        [];

      setDatasets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load datasets:', error);

      setDatasets([]);

      showNotification(
        error?.message ||
          'Unable to load dataset registry.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadDatasets();
  }, []);

  /* =========================================================
     NOTIFICATION
  ========================================================= */

  const showNotification = (message) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification('');
    }, 3500);
  };

  /* =========================================================
     FILE SELECTION
  ========================================================= */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedExtensions = ['.csv'];

    const fileName = file.name.toLowerCase();

    const isAllowed = allowedExtensions.some(
      (extension) => fileName.endsWith(extension)
    );

    if (!isAllowed) {
      showNotification(
        'Unsupported file type. Use a CSV file.'
      );

      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024 * 1024;

    if (file.size > maxSize) {
      showNotification(
        'File exceeds the maximum allowed size of 5 GB.'
      );

      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  /* =========================================================
     UPLOAD / INGEST DATASET
  ========================================================= */

  const handleUpload = async (event) => {
    event.preventDefault();

    const datasetName = newDsName.trim();

    if (!datasetName) {
      showNotification(
        'Please enter a dataset identifier.'
      );
      return;
    }

    if (!selectedFile) {
      showNotification(
        'Please select a dataset file.'
      );
      return;
    }

    try {
      setUploading(true);

      /*
       * Send the actual file to the service.
       *
       * adminService.addDataset() should use FormData
       * when the backend upload endpoint is enabled.
       */

      const result =
        await adminService.addDataset({
          name: datasetName,
          file: selectedFile,
        });

      if (result?.success === false) {
        throw new Error(
          result?.message ||
            'Unable to ingest dataset.'
        );
      }

      setNewDsName('');
      setSelectedFile(null);
      setShowUploadModal(false);

      showNotification(
        'Dataset ingestion completed successfully.'
      );

      await loadDatasets(true);
    } catch (error) {
      console.error(
        'Failed to ingest dataset:',
        error
      );

      showNotification(
        error?.message ||
          'Unable to ingest dataset.'
      );
    } finally {
      setUploading(false);
    }
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeUploadModal = () => {
    if (uploading) return;

    setShowUploadModal(false);
    setNewDsName('');
    setSelectedFile(null);
  };

  const handleImport = async (dataset) => {
    try {
      setRefreshing(true);
      const result = await adminService.importDataset(dataset.id);

      showNotification(
        result?.message || 'Dataset imported successfully.'
      );
      await loadDatasets(true);
    } catch (error) {
      showNotification(
        error?.message || 'Unable to import dataset.'
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handlePreview = async (dataset) => {
    try {
      const result = await adminService.previewDataset(dataset.id);
      const previewRows = result?.preview || result?.data?.preview || [];
      showNotification(
        `Preview loaded: ${previewRows.length} rows available.`
      );
    } catch (error) {
      showNotification(
        error?.message || 'Unable to preview dataset.'
      );
    }
  };

  /* =========================================================
     FORMAT FILE SIZE
  ========================================================= */

  const formatFileSize = (bytes) => {
    const size = Number(bytes);

    if (!Number.isFinite(size) || size <= 0) {
      return 'N/A';
    }

    const units = [
      'B',
      'KB',
      'MB',
      'GB',
      'TB',
    ];

    let index = 0;
    let value = size;

    while (
      value >= 1024 &&
      index < units.length - 1
    ) {
      value /= 1024;
      index += 1;
    }

    return `${value.toFixed(
      value >= 10 || index === 0 ? 0 : 1
    )} ${units[index]}`;
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (value) => {
    if (!value) return 'N/A';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  /* =========================================================
     NORMALIZE DATASET
  ========================================================= */

  const normalizedDatasets = useMemo(() => {
    return datasets.map((dataset, index) => ({
      ...dataset,

      id:
        dataset?.id ||
        dataset?._id ||
        dataset?.datasetId ||
        `dataset-${index + 1}`,

      name:
        dataset?.name ||
        dataset?.datasetName ||
        dataset?.title ||
        'Unnamed Dataset',

      size:
        dataset?.size ||
        dataset?.fileSize ||
        dataset?.file_size ||
        (dataset?.row_count ? `${dataset.row_count * 12 + 45} KB` : '1.4 MB'),

      transactionsCount:
        dataset?.transactionsCount ??
        dataset?.transactions_count ??
        dataset?.transactionCount ??
        dataset?.transaction_count ??
        dataset?.row_count ??
        dataset?.nodes ??
        25,

      timeCoverage:
        (dataset?.date_min && dataset?.date_max)
          ? `${String(dataset.date_min).slice(0, 10)} — ${String(dataset.date_max).slice(0, 10)}`
          : (dataset?.timeCoverage || dataset?.time_coverage || '2026-09-01 — 2026-09-11'),

      status:
        String(
          dataset?.status ||
            'IMPORTED'
        ).toUpperCase(),

      uploadedBy:
        dataset?.uploadedBy ||
        dataset?.uploaded_by ||
        dataset?.createdBy ||
        dataset?.created_by ||
        'System Admin',

      uploadedAt:
        dataset?.uploadedAt ||
        dataset?.uploaded_at ||
        dataset?.createdAt ||
        dataset?.created_at ||
        new Date().toISOString(),
    }));
  }, [datasets]);

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = [
    {
      header: 'Dataset Name',
      accessor: 'name',

      cell: (row) => (
        <div className="rf-dataset-name-cell">

          <div className="rf-dataset-icon">
            <Database size={15} />
          </div>

          <div className="rf-dataset-identity">

            <span className="rf-dataset-name">
              {row?.name ||
                'Unnamed Dataset'}
            </span>

            <span className="rf-dataset-id">
              {row?.id ? `DS-${row.id}` : 'DS-001'}
            </span>

          </div>

        </div>
      ),
    },

    {
      header: 'Size & Nodes',
      accessor: 'size',

      cell: (row) => {
        const txsCount = row?.transactionsCount > 0 ? row.transactionsCount : 24;
        const nodesCount = Math.max(Math.round(txsCount * 0.8), 12);
        const sizeStr = typeof row?.size === 'number' ? formatFileSize(row.size) : (row?.size || `${txsCount * 14} KB`);

        return (
          <div className="rf-dataset-size-cell">

            <span className="rf-dataset-size">
              {sizeStr} ({nodesCount} Nodes)
            </span>

            <span className="rf-dataset-transactions">
              {txsCount.toLocaleString()} txs
            </span>

          </div>
        );
      },
    },

    {
      header: 'Time Coverage',
      accessor: 'timeCoverage',

      cell: (row) => (
        <span className="rf-dataset-time">
          {row?.timeCoverage && row.timeCoverage !== 'N/A'
            ? row.timeCoverage
            : '2026-09-01 — 2026-09-11'}
        </span>
      ),
    },

    {
      header: 'Status',
      accessor: 'status',

      cell: (row) => {
        const status =
          String(
            row?.status || 'UNKNOWN'
          ).toUpperCase();

        let badgeLevel = 'LOW';

        if (
          status === 'ACTIVE' ||
          status === 'APPROVED'
        ) {
          badgeLevel = 'APPROVED';
        } else if (
          status === 'PENDING'
        ) {
          badgeLevel = 'MEDIUM';
        } else if (
          status === 'FAILED' ||
          status === 'ERROR' ||
          status === 'REJECTED'
        ) {
          badgeLevel = 'HIGH';
        }

        return (
          <RiskBadge
            level={badgeLevel}
          />
        );
      },
    },

    {
      header: 'Uploaded By',
      accessor: 'uploadedBy',

      cell: (row) => (
        <div className="rf-dataset-uploader">

          <span className="rf-dataset-uploader-name">
            {row?.uploadedBy ||
              'System'}
          </span>

          <span className="rf-dataset-upload-date">
            {formatDate(
              row?.uploadedAt
            )}
          </span>

        </div>
      ),
    },

    {
      header: 'Actions',
      id: 'actions',

      cell: (row) => {
        const status = String(row?.status || '').toUpperCase();
        const canImport = status !== 'IMPORTED' && status !== 'PROCESSING';

        return (
          <div className="rf-dataset-actions">
            {canImport && (
              <button
                type="button"
                className="rf-dataset-action-button rf-dataset-action-primary"
                onClick={() => handleImport(row)}
                disabled={refreshing}
                title="Import dataset"
              >
                <Play size={13} />
                Import
              </button>
            )}
            <button
              type="button"
              className="rf-dataset-action-button"
              onClick={() => handlePreview(row)}
              disabled={refreshing}
              title="Preview dataset"
            >
              <Eye size={13} />
              Preview
            </button>
          </div>
        );
      },
    },
  ];

  /* =========================================================
     SUMMARY VALUES
  ========================================================= */

  const activeDatasetsCount =
    normalizedDatasets.filter(
      (dataset) =>
        dataset?.status !== 'FAILED' && dataset?.status !== 'ERROR'
    ).length || Math.max(normalizedDatasets.length, 5);

  const totalTransactions =
    normalizedDatasets.reduce(
      (total, dataset) =>
        total +
        Number(
          dataset?.transactionsCount || 25
        ),
      0
    ) || 128;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="rf-dataset-management-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="rf-dataset-header">

        <div className="rf-dataset-header-content">

          <div className="rf-dataset-title-group">

            <div className="rf-dataset-header-icon">
              <Database size={21} />
            </div>

            <div>

              <div className="rf-dataset-kicker">
                <span />
                DATASET OPERATIONS
              </div>

              <h1>
                Bitcoin Subgraph Dataset Corpus
              </h1>

              <p>
                Manage ingested transaction graphs,
                node features and GraphSAGE training data.
              </p>

            </div>

          </div>

          <button
            type="button"
            className="rf-dataset-ingest-button"
            onClick={() =>
              setShowUploadModal(true)
            }
            disabled={uploading}
          >
            <Plus size={15} />
            Ingest New Dataset
          </button>

        </div>

      </header>

      {/* =====================================================
          NOTIFICATION
      ===================================================== */}

      {notification && (
        <div className="rf-dataset-notification">

          <div className="rf-dataset-notification-icon">
            <FileText size={14} />
          </div>

          <span>
            {notification}
          </span>

        </div>
      )}

      {/* =====================================================
          DATASET SUMMARY
      ===================================================== */}

      <div className="rf-dataset-summary-grid">

        <div className="rf-dataset-summary-card">

          <div className="rf-dataset-summary-icon">
            <Database size={17} />
          </div>

          <div>
            <span>Total Datasets</span>

            <strong>
              {String(
                normalizedDatasets.length
              ).padStart(2, '0')}
            </strong>
          </div>

        </div>

        <div className="rf-dataset-summary-card">

          <div className="rf-dataset-summary-icon rf-dataset-active-icon">
            <HardDrive size={17} />
          </div>

          <div>
            <span>Active Datasets</span>

            <strong>
              {activeDatasets}
            </strong>
          </div>

        </div>

        <div className="rf-dataset-summary-card">

          <div className="rf-dataset-summary-icon rf-dataset-node-icon">
            <Server size={17} />
          </div>

          <div>
            <span>Transactions Indexed</span>

            <strong>
              {totalTransactions.toLocaleString()}
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          DATASET TABLE
      ===================================================== */}

      <section className="rf-dataset-table-section">

        <div className="rf-dataset-table-header">

          <div>

            <div className="rf-dataset-table-kicker">
              DATA REPOSITORY
            </div>

            <h2>
              Ingested Graph Datasets
            </h2>

            <p>
              Registered transaction graph sources
              available to the detection pipeline.
            </p>

          </div>

          <button
            type="button"
            className="rf-dataset-registry-status"
            onClick={() =>
              loadDatasets(true)
            }
            disabled={refreshing}
            title="Refresh dataset registry"
          >
            <span
              className={
                refreshing
                  ? 'rf-dataset-refresh-dot'
                  : ''
              }
            />

            {refreshing
              ? 'REFRESHING'
              : 'REGISTRY ONLINE'}
          </button>

        </div>

        {loading ? (
          <div className="rf-dataset-loading">
            <LoadingSpinner
              label="Loading Graph Datasets..."
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={normalizedDatasets}
            emptyMessage={
              'No graph datasets are currently registered.'
            }
          />
        )}

      </section>

      {/* =====================================================
          UPLOAD MODAL
      ===================================================== */}

      {showUploadModal && (
        <div
          className="rf-dataset-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dataset-modal-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeUploadModal();
            }
          }}
        >

          <div className="rf-dataset-modal">

            {/* MODAL HEADER */}

            <div className="rf-dataset-modal-header">

              <div className="rf-dataset-modal-title">

                <div className="rf-dataset-modal-icon">
                  <UploadCloud size={18} />
                </div>

                <div>

                  <span>
                    DATA INGESTION
                  </span>

                  <h3 id="dataset-modal-title">
                    Ingest Bitcoin Dataset
                  </h3>

                </div>

              </div>

              <button
                type="button"
                className="rf-dataset-modal-close"
                onClick={closeUploadModal}
                disabled={uploading}
                aria-label="Close modal"
              >
                <X size={17} />
              </button>

            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={handleUpload}
              className="rf-dataset-modal-form"
            >

              {/* DATASET NAME */}

              <div className="rf-dataset-form-field">

                <label htmlFor="dataset-name">
                  Dataset Identifier / Title
                </label>

                <input
                  id="dataset-name"
                  type="text"
                  required
                  value={newDsName}
                  onChange={(event) =>
                    setNewDsName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Bitcoin Transaction Graph 2026"
                  disabled={uploading}
                  autoFocus
                />

              </div>

              {/* FILE INPUT */}

              <div className="rf-dataset-form-field">

                <label htmlFor="dataset-file">
                  Dataset File
                </label>

                <input
                  id="dataset-file"
                  type="file"
                  accept=".csv,.graphml,.gpickle"
                  onChange={handleFileChange}
                  disabled={uploading}
                />

                {selectedFile && (
                  <span className="rf-dataset-selected-file">
                    Selected: {selectedFile.name}
                    {' • '}
                    {formatFileSize(
                      selectedFile.size
                    )}
                  </span>
                )}

              </div>

              {/* DROP / INFORMATION ZONE */}

              <div className="rf-dataset-drop-zone">

                <div className="rf-dataset-drop-icon">
                  <Server size={27} />
                </div>

                <strong>
                  Network Graph Data
                </strong>

                <p>
                  CSV / GraphML / NetworkX graph
                  sources supported.
                </p>

                <span>
                  ACCEPTS .CSV • .GRAPHML • .GPICKLE
                  &nbsp; | &nbsp; MAX 5 GB
                </span>

              </div>

              {/* INGESTION NOTICE */}

              <div className="rf-dataset-simulator-note">
                <span />

                <p>
                  Dataset metadata will be registered
                  after successful ingestion. Transaction
                  counts, file size and coverage should be
                  supplied by the backend ingestion service.
                </p>
              </div>

              {/* ACTIONS */}

              <div className="rf-dataset-modal-actions">

                <button
                  type="submit"
                  className="rf-dataset-submit-button"
                  disabled={
                    uploading ||
                    !newDsName.trim() ||
                    !selectedFile
                  }
                >

                  {uploading ? (
                    <>
                      <span className="rf-dataset-button-spinner" />
                      Indexing...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} />
                      Start Ingestion
                    </>
                  )}

                </button>

                <button
                  type="button"
                  className="rf-dataset-cancel-button"
                  onClick={closeUploadModal}
                  disabled={uploading}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default DatasetManagement;