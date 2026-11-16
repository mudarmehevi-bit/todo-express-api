import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import type { TodoStats, DashboardProps } from './types';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API: string = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard({ username }: DashboardProps) {
  const [stats, setStats] = useState<TodoStats>({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${API}/todos/stats`, { credentials: 'include' })
      .then((res) => res.json() as Promise<TodoStats>)
      .then((data) => {
        if (typeof data.total === 'number') setStats(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const pieData: ChartData<'pie'> = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats.completed, stats.pending],
        backgroundColor: ['#4caf50', '#ff9800'],
      },
    ],
  };

  const barData: ChartData<'bar'> = {
    labels: ['Total', 'Completed', 'Pending'],
    datasets: [
      {
        label: 'Tasks',
        data: [stats.total, stats.completed, stats.pending],
        backgroundColor: ['#2196f3', '#4caf50', '#ff9800'],
      },
    ],
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
  };

  if (loading) return <p>Loading dashboard statistics...</p>;

  return (
    <div className="dashboard-flex">
      <div className="chart-card">
        <h3>{username ? `${username}'s Task Summary` : 'Task Summary'}</h3>
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
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
}