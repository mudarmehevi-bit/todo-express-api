import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API = 'http://localhost:5000';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/todos/stats`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.total === 'number') setStats(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const pieData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats.completed, stats.pending],
        backgroundColor: ['#4caf50', '#ff9800'],
      },
    ],
  };

  const barData = {
    labels: ['Total', 'Completed', 'Pending'],
    datasets: [
      {
        label: 'Tasks',
        data: [stats.total, stats.completed, stats.pending],
        backgroundColor: ['#2196f3', '#4caf50', '#ff9800'],
      },
    ],
  };

  if (loading) return <p>Loading dashboard statistics...</p>;

  return (
    <div className="dashboard-flex">
      <div className="chart-card">
        <h3>Task Summary</h3>
        <p><strong>Total Tasks:</strong> {stats.total}</p>
        <p><strong>Completed:</strong> {stats.completed}</p>
        <p><strong>Pending:</strong> {stats.pending}</p>
      </div>

      <div className="chart-card">
        <h3>Completion Ratio (Pie)</h3>
        <Pie data={pieData} />
      </div>

      <div className="chart-card">
        <h3>Task Breakdown (Bar)</h3>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  );
}