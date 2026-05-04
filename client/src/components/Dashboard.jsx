import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Clock, CheckCircle2, AlertCircle, Filter, RefreshCw } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [activeDepartment, setActiveDepartment] = useState('Municipal Corporation');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resComplaints, resStats] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/complaints'),
        axios.get('http://127.0.0.1:5000/api/stats')
      ]);
      setComplaints(resComplaints.data);
      setStats(resStats.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/api/complaints/${id}`, { status });
      fetchData();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  if (loading && !stats) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Dashboard...</div>;

  const pieData = {
    labels: stats?.categories.map(c => c._id) || [],
    datasets: [{
      data: stats?.categories.map(c => c.count) || [],
      backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'],
      borderWidth: 0,
    }]
  };

  const DEPARTMENTS = [
    'Municipal Corporation',
    'Public Works Department',
    'Water Supply Department',
    'Electric Department'
  ];

  const filteredComplaints = complaints.filter(c => c.department === activeDepartment);

  return (
    <div>
      {/* Department Switcher Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {DEPARTMENTS.map(dept => (
          <button
            key={dept}
            onClick={() => setActiveDepartment(dept)}
            className={activeDepartment === dept ? 'btn-primary' : 'glass'}
            style={{ 
              whiteSpace: 'nowrap', 
              padding: '0.75rem 1.5rem',
              opacity: activeDepartment === dept ? 1 : 0.7
            }}
          >
            {dept}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>
        <h2 style={{ margin: 0 }}>{activeDepartment} Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Managing {filteredComplaints.length} grievances</p>
      </div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{filteredComplaints.filter(c => c.status === 'Pending').length}</h3>
          </div>
        </div>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <RefreshCw size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>In Progress</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{filteredComplaints.filter(c => c.status === 'In Progress').length}</h3>
          </div>
        </div>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Resolved</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{filteredComplaints.filter(c => c.status === 'Resolved').length}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Table */}
        <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Recent Complaints</h3>
            <button onClick={fetchData} className="glass" style={{ padding: '0.5rem' }}><RefreshCw size={16} /></button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Grievance</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Priority</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600 }}>{c.text.substring(0, 50)}...</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.location}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {c.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: c.priority === 'High' ? 'var(--danger)' : c.priority === 'Medium' ? 'var(--warning)' : 'var(--success)',
                      fontWeight: 700
                    }}>
                      {c.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={c.status} 
                      onChange={(e) => updateStatus(c._id, e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.3rem' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Issue Categories</h3>
            <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
            </div>
          </div>
          
          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h4>AI Insight</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {stats?.categories[0]?._id || 'Road Issues'} is currently the most reported category. Recommend assigning more resources to this department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
