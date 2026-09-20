// src/pages/operations/OpsDashboard.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactECharts from 'echarts-for-react';
import { acknowledgeAlert, fetchAlertsData, fetchKpisData } from '../../features/telemetry/telemetrySlice';
import { fetchAnalyticsAPI } from '../../services/api';
import { Activity, Clock, Wrench, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function OpsDashboard() {
  const { activeAlerts, kpis } = useSelector((state) => state.telemetry);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [chartData, setChartData] = useState({
    days: ['1', '5', '10', '15', '20', '25', '30'],
    values: [99.2, 98.5, 99.0, 97.1, 98.8, 99.5, 98.4]
  });

  useEffect(() => {
    dispatch(fetchKpisData());
    dispatch(fetchAlertsData());
    
    // Fetch chart data separately or use the uptimeHistory from fetchAnalyticsAPI
    fetchAnalyticsAPI()
      .then(data => {
        if (data.uptimeHistory) {
          setChartData(data.uptimeHistory);
        }
      })
      .catch(err => console.error("Failed to fetch analytics for chart", err));
  }, [dispatch]);

  const handleAcknowledge = (alertId) => {
    dispatch(acknowledgeAlert({ alertId, userName: user || 'Operations Engineer' }));
  };

  // 30-Day Asset Health Chart Configuration (ECharts)
  const chartOptions = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: chartData.days },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value} %' } },
    series: [
      {
        name: 'Plant Uptime',
        type: 'line',
        smooth: true,
        data: chartData.values,
        areaStyle: { opacity: 0.1, color: '#0d6efd' },
        lineStyle: { color: '#0d6efd', width: 3 },
        itemStyle: { color: '#0d6efd' }
      }
    ]
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Operations Overview</h2>
        <p className="text-muted mb-0">Monitor plant throughput, asset reliability, and active emergencies.</p>
      </div>

      {/* KPI Widgets */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted fw-bold mb-0">Uptime & Health</h6>
                <div className="p-2 bg-primary bg-opacity-10 rounded text-primary"><Activity size={20} /></div>
              </div>
              <h3 className="fw-bold mb-1">{kpis.uptimePercentage}%</h3>
              <p className="text-success small fw-bold mb-0">Nominal Operation</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted fw-bold mb-0">MTTR</h6>
                <div className="p-2 bg-info bg-opacity-10 rounded text-info"><Wrench size={20} /></div>
              </div>
              <h3 className="fw-bold mb-1">{kpis.mttr} <span className="fs-6 text-muted">hrs</span></h3>
              <p className="text-muted small mb-0">Mean Time To Repair (Simulated)</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted fw-bold mb-0">MTBF</h6>
                <div className="p-2 bg-success bg-opacity-10 rounded text-success"><Clock size={20} /></div>
              </div>
              <h3 className="fw-bold mb-1">{kpis.mtbf} <span className="fs-6 text-muted">hrs</span></h3>
              <p className="text-muted small mb-0">Mean Time Between Failures (Simulated)</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100 border-start border-danger border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted fw-bold mb-0">Active Breaches</h6>
                <div className="p-2 bg-danger bg-opacity-10 rounded text-danger"><AlertTriangle size={20} /></div>
              </div>
              <h3 className="fw-bold mb-1 text-danger">{activeAlerts.filter(a => !a.isAcknowledged).length}</h3>
              <p className="text-danger small fw-bold mb-0">Unacknowledged Alarms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Priority Alert Feed */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0">Priority Alert Feed</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small">
                    <tr>
                      <th className="ps-4">Asset</th>
                      <th>Severity & Impact</th>
                      <th>Status</th>
                      <th className="pe-4 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAlerts.map((alert) => (
                      <tr key={alert.id} className={!alert.isAcknowledged ? 'bg-danger bg-opacity-10' : ''}>
                        <td className="ps-4">
                          <div className="fw-bold">{alert.pipelineId}</div>
                          <div className="small text-muted">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                        </td>
                        <td>
                          <div className={`badge mb-1 ${alert.severity === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                            {alert.severity} - {alert.condition}
                          </div>
                          <div className="small text-muted">{alert.operationalImpact}</div>
                        </td>
                        <td>
                          {alert.isAcknowledged ? (
                            <span className="badge bg-light text-success border border-success d-inline-flex align-items-center gap-1">
                              <ShieldCheck size={12} /> Claimed by {alert.acknowledgedBy}
                            </span>
                          ) : (
                            <span className="badge bg-danger">Unacknowledged</span>
                          )}
                        </td>
                        <td className="pe-4 text-end">
                          {!alert.isAcknowledged ? (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              Acknowledge
                            </button>
                          ) : (
                            <button className="btn btn-sm btn-outline-primary fw-bold">
                              Dispatch Team
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0">Historical Asset Health Trend</h6>
            </div>
            <div className="card-body">
              <ReactECharts option={chartOptions} style={{ height: '300px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}