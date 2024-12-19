import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import './StravaStats.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StravaStats: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [weeklyIndexes, setWeeklyIndexes] = useState<any[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [weeksByYear, setWeeksByYear] = useState<{ [year: string]: string[] }>({});
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [expandedYears, setExpandedYears] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false); 
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      const accessToken = localStorage.getItem('strava_access_token');

      if (accessToken) {
        try {
          const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setActivities(response.data);
        } catch (err) {
          console.error('Error fetching activities:', err);
          setError('Failed to fetch activities.');
        }
      } else {
        setError('No access token found.');
      }
    };

    fetchActivities();
  }, []);

  const calculateWeeklyIndexes = (activities: any[]) => {
    const weeks: { [key: string]: any[] } = {};
    const weeksSet: { [year: string]: Set<string> } = {};
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(today.getFullYear() - 1);

    activities.forEach(activity => {
      const activityDate = new Date(activity.start_date);
      if (activityDate >= yearAgo && activityDate <= today) {
        const weekStart = new Date(activityDate);
        const dayOfWeek = weekStart.getUTCDay();
        const daysSinceMonday = (dayOfWeek + 6) % 7;
        weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);

        const weekKey = weekStart.toISOString().split('T')[0];
        const year = weekStart.getUTCFullYear();

        if (!weeks[weekKey]) {
          weeks[weekKey] = [];
        }
        weeks[weekKey].push(activity);

        if (!weeksSet[year]) {
          weeksSet[year] = new Set();
        }
        weeksSet[year].add(weekKey);
      }
    });

    const weeksByYearArray: { [year: string]: string[] } = {};
    for (const year in weeksSet) {
      weeksByYearArray[year] = Array.from(weeksSet[year]).sort();
    }
    setWeeksByYear(weeksByYearArray); 

    const indexesArray = Object.entries(weeks).map(([week, weekActivities]) => {
      const runningActivities = weekActivities.filter(activity => activity.type === 'Run');
      const totalDistance = runningActivities.reduce((acc, activity) => acc + activity.distance, 0) / 1000; // km
      const totalTime = runningActivities.reduce((acc, activity) => acc + activity.moving_time, 0) / 60; // min
      const totalHeartRate = runningActivities.reduce((acc, activity) => acc + (activity.average_heartrate || 0), 0);
      const totalActivities = runningActivities.length;
      
      const avgHeartRate = totalActivities > 0 ? totalHeartRate / totalActivities : 0;
      const avgPace = totalDistance > 0 ? totalTime / totalDistance : 0; // min/km

      const avgSpeed = totalDistance > 0 ? totalDistance / (totalTime / 60) : 0; // km/h
      const performanceIndex = (avgSpeed * 0.5) + (avgPace * 0.4) + (avgHeartRate * 0.1);

      return {
        week,
        totalDistance,
        totalTime,
        avgHeartRate,
        avgPace,
        performanceIndex,
      };
    });

    setWeeklyIndexes(indexesArray);
  };

  useEffect(() => {
    if (activities.length > 0) {
      calculateWeeklyIndexes(activities);
    }
  }, [activities]);

  const handleWeekSelection = (week: string) => {
    setSelectedWeeks(prev =>
      prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]
    );
  };

  const handleColumnSelection = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  };

  const handleYearToggle = (year: string) => {
    setExpandedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const filteredWeeklyIndexes = weeklyIndexes.filter(index => selectedWeeks.includes(index.week));

  const chartData: ChartData<'line'> = {
    labels: filteredWeeklyIndexes.map(indexData => indexData.week).reverse(),
    datasets: [
      {
        label: 'Distance',
        data: filteredWeeklyIndexes.map(indexData => indexData.totalDistance).reverse(),
        borderColor: '#fc4c02',
        backgroundColor: 'rgba(252, 76, 2, 0.2)',
        fill: true,
        tension: 0.4,
        hidden: !selectedColumns.includes('Total Distance (km)'),
      },
      {
        label: 'Time',
        data: filteredWeeklyIndexes.map(indexData => indexData.totalTime).reverse(),
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        fill: true,
        tension: 0.4,
        hidden: !selectedColumns.includes('Total Time (min)'),
      },
      {
        label: 'Heart Rate',
        data: filteredWeeklyIndexes.map(indexData => indexData.avgHeartRate).reverse(),
        borderColor: '#50e3c2',
        backgroundColor: 'rgba(80, 227, 194, 0.2)',
        fill: true,
        tension: 0.4,
        hidden: !selectedColumns.includes('Average Heart Rate'),
      },
      {
        label: 'Pace',
        data: filteredWeeklyIndexes.map(indexData => indexData.avgPace).reverse(),
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243, 156, 18, 0.2)',
        fill: true,
        tension: 0.4,
        hidden: !selectedColumns.includes('Average Pace (min/km)'),
      },
      {
        label: 'Performance',
        data: filteredWeeklyIndexes.map(indexData => indexData.performanceIndex).reverse(),
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        fill: true,
        tension: 0.4,
        hidden: !selectedColumns.includes('Performance Index'),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (evt: any) => {
      const chartInstance = chartRef.current;
      const activePoints = chartInstance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
      if (activePoints.length > 0) {
        const datasetIndex = activePoints[0].datasetIndex;
        const columnLabel = chartData.datasets[datasetIndex].label;
        if (columnLabel) {
          handleColumnSelection(columnLabel);
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Weeks',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  if (error) {
    return <div>{error}</div>;
  }

  const collapseSelect = () => {
    setCollapsed(prev => !prev);
  };
  return (
    <div className="container">
      

      <div className={collapsed ? 'week-selection collapsed': 'week-selection'}>
      <div className="week-header2">
        <h3>Select Weeks:</h3>
        <button onClick={collapseSelect} className={collapsed ? 'filledButton': 'emptyButton'}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
        {Object.entries(weeksByYear)
          .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA)) // Sort years descending
          .map(([year, weeks]) => (
            <div key={year} className='year'>
              <h4 onClick={() => handleYearToggle(year)} style={{ cursor: 'pointer' }}>
                {year} {expandedYears.includes(year) ? '↓' : '→'}
              </h4>
              <div className="weeks">
                {expandedYears.includes(year) && weeks.sort().map(week => (
                  <div key={week}>
                    <input
                      type="checkbox"
                      checked={selectedWeeks.includes(week)}
                      onChange={() => handleWeekSelection(week)}
                    />
                    <label>{week}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>


      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Distance</th>
              <th>Time</th>
              <th>Heart Rate</th>
              <th>Pace</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {filteredWeeklyIndexes.map(index => (
              <tr key={index.week}>
                <td>{index.week}</td>
                <td>{index.totalDistance.toFixed(2)}</td>
                <td>{index.totalTime.toFixed(2)}</td>
                <td>{index.avgHeartRate.toFixed(2)}</td>
                <td>{index.avgPace.toFixed(2)}</td>
                <td>{index.performanceIndex.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="chart-container">
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default StravaStats;
