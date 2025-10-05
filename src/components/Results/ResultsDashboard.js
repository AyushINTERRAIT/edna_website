import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultsAPI } from '../../services/api';
import Navbar from '../Common/Navbar';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { FaArrowLeft, FaDownload, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import './ResultsDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

const ResultsDashboard = () => {
  const { jobId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('taxonomy');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadResults();
  }, [jobId]);

  const loadResults = async () => {
    try {
      const data = await resultsAPI.getByJobId(jobId);
      setResults(data);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format) => {
    if (format === 'csv') {
      const csv = [
        ['Taxon', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species', 'Confidence', 'Read Count'].join(','),
        ...results.taxonomicData.map((t) =>
          [t.taxon, t.kingdom, t.phylum, t.class, t.order, t.family, t.genus, t.species, t.confidence, t.readCount].join(',')
        ),
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_job_${jobId}.csv`;
      a.click();
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (!results) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card">
            <h2>No Results Found</h2>
            <p>Results for this analysis job are not available.</p>
          </div>
        </div>
      </>
    );
  }

  const filteredTaxonomicData = results.taxonomicData.filter((t) =>
    t.taxon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for visualizations
  const abundanceData = results.taxonomicData.slice(0, 10).map((t) => ({
    name: t.species || t.genus || t.family,
    reads: t.readCount,
  }));

  const phylumData = results.taxonomicData.reduce((acc, t) => {
    const existing = acc.find((item) => item.name === t.phylum);
    if (existing) {
      existing.value += t.readCount;
    } else {
      acc.push({ name: t.phylum, value: t.readCount });
    }
    return acc;
  }, []);

  const confidenceData = results.taxonomicData.map((t, i) => ({
    index: i + 1,
    confidence: t.confidence,
    reads: t.readCount,
    name: t.species || t.genus,
  }));

  return (
    <>
      <Navbar />
      <div className="results-container">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="results-header">
          <div>
            <h1>Analysis Results</h1>
            <p>Job ID: #{jobId}</p>
          </div>
          <button className="btn btn-primary" onClick={() => exportData('csv')}>
            <FaDownload /> Export Data (CSV)
          </button>
        </div>

        {/* Metrics Overview */}
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Taxa</h3>
            <div className="metric-value">{results.biodiversityMetrics.totalTaxa}</div>
          </div>
          <div className="metric-card">
            <h3>Total Reads</h3>
            <div className="metric-value">{results.biodiversityMetrics.totalReads.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h3>Shannon Index</h3>
            <div className="metric-value">{results.biodiversityMetrics.alphaDiversity.shannon.toFixed(2)}</div>
          </div>
          <div className="metric-card">
            <h3>Simpson Index</h3>
            <div className="metric-value">{results.biodiversityMetrics.alphaDiversity.simpson.toFixed(2)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="results-tabs">
          <button
            className={`tab-btn ${activeTab === 'taxonomy' ? 'active' : ''}`}
            onClick={() => setActiveTab('taxonomy')}
          >
            Taxonomic Composition
          </button>
          <button
            className={`tab-btn ${activeTab === 'abundance' ? 'active' : ''}`}
            onClick={() => setActiveTab('abundance')}
          >
            Abundance & Diversity
          </button>
          <button
            className={`tab-btn ${activeTab === 'novel' ? 'active' : ''}`}
            onClick={() => setActiveTab('novel')}
          >
            Novel Taxa ({results.novelTaxa.length})
          </button>
        </div>

        {/* Taxonomic Composition Tab */}
        {activeTab === 'taxonomy' && (
          <div className="results-card">
            <div className="card-header">
              <h2>Taxonomic Composition</h2>
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search taxa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="visualization-grid">
              <div className="chart-container">
                <h3>Distribution by Phylum</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={phylumData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {phylumData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Confidence Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" name="Taxa" />
                    <YAxis dataKey="confidence" name="Confidence" domain={[0, 1]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={confidenceData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-container">
              <h3>Identified Taxa</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Taxon</th>
                    <th>Kingdom</th>
                    <th>Phylum</th>
                    <th>Class</th>
                    <th>Order</th>
                    <th>Family</th>
                    <th>Genus</th>
                    <th>Species</th>
                    <th>Confidence</th>
                    <th>Reads</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTaxonomicData.map((taxon) => (
                    <tr key={taxon.id}>
                      <td><strong>{taxon.taxon}</strong></td>
                      <td>{taxon.kingdom}</td>
                      <td>{taxon.phylum}</td>
                      <td>{taxon.class}</td>
                      <td>{taxon.order}</td>
                      <td>{taxon.family}</td>
                      <td>{taxon.genus}</td>
                      <td>{taxon.species}</td>
                      <td>
                        <span className={`confidence-badge ${taxon.confidence >= 0.8 ? 'high' : taxon.confidence >= 0.6 ? 'medium' : 'low'}`}>
                          {(taxon.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td>{taxon.readCount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Abundance & Diversity Tab */}
        {activeTab === 'abundance' && (
          <div className="results-card">
            <h2>Abundance & Diversity Analysis</h2>

            <div className="visualization-grid">
              <div className="chart-container full-width">
                <h3>Top 10 Taxa by Read Count</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={abundanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="reads" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="diversity-metrics">
              <h3>Alpha Diversity Metrics</h3>
              <div className="metrics-row">
                <div className="metric-item">
                  <span className="metric-label">Shannon Diversity Index:</span>
                  <span className="metric-value">
                    {results.biodiversityMetrics.alphaDiversity.shannon.toFixed(3)}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Simpson Diversity Index:</span>
                  <span className="metric-value">
                    {results.biodiversityMetrics.alphaDiversity.simpson.toFixed(3)}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Chao1 Richness Estimator:</span>
                  <span className="metric-value">
                    {results.biodiversityMetrics.alphaDiversity.chao1.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Novel Taxa Tab */}
        {activeTab === 'novel' && (
          <div className="results-card">
            <div className="alert alert-info">
              <FaExclamationTriangle /> The following sequences were identified with low confidence and may represent novel or undescribed taxa.
            </div>

            {results.novelTaxa.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sequence ID</th>
                    <th>Read Count</th>
                    <th>Confidence</th>
                    <th>Closest Match</th>
                    <th>Similarity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.novelTaxa.map((novel) => (
                    <tr key={novel.id}>
                      <td><strong>{novel.sequenceId}</strong></td>
                      <td>{novel.readCount}</td>
                      <td>
                        <span className="confidence-badge low">
                          {(novel.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td>{novel.closestMatch}</td>
                      <td>{(novel.similarity * 100).toFixed(1)}%</td>
                      <td>
                        <span className="status-badge status-queued">
                          {novel.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-message">No novel taxa identified in this analysis.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ResultsDashboard;
