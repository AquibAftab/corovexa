// src/pages/operations/PipelineMonitoring.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactECharts from 'echarts-for-react';
import { MapPin, Settings, AlertTriangle, CheckCircle, ActivitySquare } from 'lucide-react';
import { fetchPipelineData } from '../../features/telemetry/telemetrySlice';

export default function PipelineMonitoring() {
  const dispatch = useDispatch();
  const { pipelines } = useSelector((state) => state.telemetry);
  
  useEffect(() => {
    dispatch(fetchPipelineData());
  }, [dispatch]);

  // Default to the first pipeline in the state
  const [selectedPipelineId, setSelectedPipelineId] = useState('');

  // Update selected pipeline when pipelines load if it's not set
  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].pipelineId);
    }
  }, [pipelines, selectedPipelineId]);

  const activePipeline = pipelines.find(p => p.pipelineId === selectedPipelineId);

  // Dynamic ECharts Gauge Configuration for Sensors
  const getGaugeOption = (sensor) => {
    return {
      series: [
        {
          type: 'gauge',
          min: 0,
          max: sensor.thresholds.criticalMax + (sensor.thresholds.criticalMax * 0.2), // 20% headroom above critical
          progress: { show: true, width: 12 },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [sensor.thresholds.warningMax / (sensor.thresholds.criticalMax * 1.2), '#22c55e'], // Healthy Green
                [sensor.thresholds.criticalMax / (sensor.thresholds.criticalMax * 1.2), '#eab308'], // Warning Yellow
                [1, '#ef4444'] // Critical Red
              ]
            }
          },
          pointer: { itemStyle: { color: 'inherit' } },
          axisTick: { show: false },
          splitLine: { length: 15, lineStyle: { color: 'inherit', width: 2 } },
          axisLabel: { color: '#6c757d', distance: 20, fontSize: 10 },
          detail: {
            valueAnimation: true,
            formatter: `{value}\n{a|${sensor.unit}}`,
            rich: { a: { fontSize: 12, color: '#6c757d', padding: [5, 0, 0, 0] } },
            fontSize: 24,
            fontWeight: 'bold',
            color: 'inherit',
            offsetCenter: [0, '70%']
          },
          data: [{ value: sensor.currentValue }]
        }
      ]
    };
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Pipeline Telemetry</h2>
          <p className="text-muted mb-0">Sensor readings from simulated telemetry dataset.</p>
        </div>
        
        {/* Pipeline Selector */}
        <div className="d-flex align-items-center gap-2">
          <label className="fw-bold text-secondary small mb-0">Select Asset:</label>
          <select 
            className="form-select form-select-sm border-secondary shadow-sm" 
            style={{ width: '200px' }}
            value={selectedPipelineId}
            onChange={(e) => setSelectedPipelineId(e.target.value)}
          >
            {pipelines.map(p => (
              <option key={p.pipelineId} value={p.pipelineId}>
                {p.pipelineId} - {p.location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activePipeline && (
        <>
          {/* Asset Context Banner */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
              <div className="d-flex align-items-center gap-3">
                <div className={`p-3 rounded text-white ${activePipeline.pipelineStatus === 'Healthy' ? 'bg-success' : 'bg-danger'}`}>
                  <ActivitySquare size={32} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1">{activePipeline.pipelineId}</h4>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <MapPin size={14} /> {activePipeline.location}
                  </div>
                </div>
              </div>

              <div className="d-flex gap-4 border-start ps-4">
                <div>
                  <div className="small text-muted fw-bold">Aggregate Status</div>
                  <div className={`fw-bold d-flex align-items-center gap-1 ${activePipeline.pipelineStatus === 'Healthy' ? 'text-success' : 'text-danger'}`}>
                    {activePipeline.pipelineStatus === 'Healthy' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {activePipeline.pipelineStatus}
                  </div>
                </div>
                <div>
                  <div className="small text-muted fw-bold">Attached Nodes</div>
                  <div className="fw-bold">{activePipeline.sensors.length} Sensors</div>
                </div>
                <div className="d-none d-lg-block">
                  <div className="small text-muted fw-bold">Simulation Controls</div>
                  <div className="form-check form-switch mt-1">
                    <input className="form-check-input" type="checkbox" role="switch" id="maintenanceToggle" />
                    <label className="form-check-label small fw-bold" htmlFor="maintenanceToggle">Maintenance Mode</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Sensor Grid */}
          <div className="row g-4">
            {activePipeline.sensors.map((sensor) => (
              <div key={sensor.sensorId} className="col-12 col-md-6 col-lg-4 col-xl-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <div className="fw-bold">{sensor.sensorId}</div>
                    <span className={`badge ${sensor.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                      {sensor.status}
                    </span>
                  </div>
                  
                  <div className="card-body d-flex flex-column justify-content-center align-items-center p-0">
                    <div className="text-center pt-3 fw-bold text-muted small text-uppercase">
                      {sensor.metric}
                    </div>
                    {/* ECharts Gauge */}
                    <ReactECharts 
                      option={getGaugeOption(sensor)} 
                      style={{ height: '220px', width: '100%' }} 
                    />
                  </div>

                  <div className="card-footer bg-light border-top-0 p-3">
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                      <span>Warn: {sensor.thresholds.warningMax} {sensor.unit}</span>
                      <span>Crit: {sensor.thresholds.criticalMax} {sensor.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}