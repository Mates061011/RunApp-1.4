import React, { useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './stravaweek.css';
import Arrow from '../../assets/clipart1181112.png';

interface RunTask {
  name: string;
  distance: number; // Distance in meters
  description: string;
  tempo: number; // Tempo in minutes per kilometer
  time: string; // Time in format HH:mm:ss
}

const ItemTypes = {
  BOX: 'box',
};

// Draggable Box Component
interface BoxProps {
  task: RunTask;
  isEditMode: boolean;
}

const Box: React.FC<BoxProps> = ({ task, isEditMode }) => {
  const [{ isDragging }, drag] = useDrag<RunTask, unknown, { isDragging: boolean }>( {
    type: ItemTypes.BOX,
    item: { ...task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditMode,
  });

  return (
    <div
      ref={drag}
      className={`box ${isDragging ? 'dragging' : ''}`}
    >
      <div className="circle"></div>
      <strong className='underline'>{task.name}</strong>
      <div className='underline hh'>
        <p className='distance'>{task.distance}m</p>
        <p className='description'>{task.description}</p>
      </div>
      <div className="h">
        <p className='tempo'><p className='x'>{task.tempo} </p><p>min/km</p></p>
        <p className='time'><p className='x'>{task.time} </p><p>min</p></p>
      </div>
    </div>
  );
};



// Droppable Day Slot Component
interface DaySlotProps {
  day: string;
  task: RunTask | null;
  date: string;
  isEditMode: boolean;
  onDrop: (day: string, itemName: string) => void;
  onDragTaskBack: (taskName: string) => void;
}

const DaySlot: React.FC<DaySlotProps> = ({ day, task, date, isEditMode, onDrop, onDragTaskBack }) => {
  const [{ canDrop, isOver }, drop] = useDrop<RunTask, void, { isOver: boolean; canDrop: boolean }>({
    accept: ItemTypes.BOX,
    drop: (item) => {
      if (item && isEditMode) {
        onDrop(day, item.name);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    canDrop: () => isEditMode, // Only allow dropping if in edit mode
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BOX,
    item: { name: task?.name || '' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !!task && isEditMode, // Ensure dragging is only enabled in edit mode
  });

  const isActive = canDrop && isOver;
  const slotClassName = isActive ? 'day-slot day-slot-active' : 'day-slot';

  return (
    <div ref={drop} className={slotClassName}>
      <div className='day'>{day}</div>
      <div className="line"></div>
      <div className="date">{date}</div>
      
      {task && (
        <div
          className="task selected"
          ref={drag}
          onDragEnd={() => onDragTaskBack(task.name)}
          draggable={isEditMode}
          onDragStart={(e) => e.dataTransfer.setData('text/plain', task.name)}
        >
          <div className="circle"></div>
          <strong className='underline'>{task.name}</strong>
          <div className='hh underline'>
            <p className='distance'>{task.distance}m</p>
            <p className='description'>{task.description}</p>
          </div>
          <div className="h">
            <p className='tempo'><p className='x'>{task.tempo} </p><p>min/km</p></p>
            <p className='time'><p className='x'>{task.time} </p><p>min</p></p>
          </div>
        </div>
      )}
    </div>
  );
};

const StravaWeek: React.FC = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const token = localStorage.getItem('JWT_TOKEN');
  const [schedule, setSchedule] = React.useState<Record<string, RunTask | null>>(() => ({
    Mon: null,
    Tue: null,
    Wed: null,
    Thu: null,
    Fri: null,
    Sat: null,
    Sun: null,
  }));

  const [tasks, setTasks] = React.useState<RunTask[]>([]);
  const [isEditMode, setIsEditMode] = React.useState(false);

  const fetchInitialTasks = async () => {
    try {
      const token = localStorage.getItem('JWT_TOKEN');
      const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
      if (!token || !userId) {
        throw new Error('User ID or token is missing from localStorage.');
      }

      const response = await fetch(`http://localhost:5000/api/activity/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const data: RunTask[] = await response.json();
      setTasks(data); // Update tasks state with data from the API
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchWeeklyPlan = async () => {
    try {
      const token = localStorage.getItem('JWT_TOKEN');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        throw new Error('User ID or token is missing from localStorage.');
      }

      const response = await fetch(`http://localhost:5000/api/week/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch weekly plan: ${response.statusText}`);
      }
      console.log(response.json)
      const weeklyPlan: Record<string, RunTask | null> = await response.json();
      setSchedule(weeklyPlan);
    } catch (error) {
      console.error('Error fetching weekly plan:', error);
    }
  };

  

  const [newTask, setNewTask] = React.useState<RunTask>({
    name: '',
    distance: 0,
    description: '',
    tempo: 0,
    time: '' 
  });

  const availableTasks = tasks.filter(task => 
    !Object.values(schedule).some(scheduledTask => scheduledTask?.name === task.name)
  );
  
    // Add this function to handle the PUT request
  const updateWeeklySchedule = async (updatedSchedule: Record<string, RunTask | null>) => {
    try {
      const token = localStorage.getItem('JWT_TOKEN');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('User ID or token is missing from localStorage.');
      }


      const transformedSchedule = {
        Mon: updatedSchedule.Mon,
        Tue: updatedSchedule.Tue,
        Wed: updatedSchedule.Wed,
        Thu: updatedSchedule.Thu,
        Fri: updatedSchedule.Fri,
        Sat: updatedSchedule.Sat,
        Sun: updatedSchedule.Sun
      };
      console.log(transformedSchedule)
      const response = await fetch(`http://localhost:5000/api/week/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transformedSchedule), // Send activities as the payload
      });

      if (!response.ok) {
        throw new Error(`Failed to update weekly schedule: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Error updating weekly schedule:', error);
    }
  };

  

  

  const handleDrop = (day: string, itemName: string) => {
    setSchedule((prevSchedule) => {
      const updatedSchedule = { ...prevSchedule };
      for (const d in updatedSchedule) {
        if (updatedSchedule[d]?.name === itemName) {
          updatedSchedule[d] = null;
          break;
        }
      }
      updatedSchedule[day] = tasks.find(task => task.name === itemName) || null;
      return updatedSchedule;
    });
  };

  const handleDragTaskBack = (taskName: string) => {
    setSchedule((prevSchedule) => {
      const updatedSchedule = { ...prevSchedule };
      for (const day in updatedSchedule) {
        if (updatedSchedule[day]?.name === taskName) {
          updatedSchedule[day] = null;
          break;
        }
      }
      return updatedSchedule;
    });
  };

  const addTask = async () => {
    try {
      // Retrieve the token from localStorage
      
      if (!token) {
        throw new Error('No token found in localStorage.');
      }
  
      // Format the task data to match the API's expected fields
      const taskData = {
        name: newTask.name,
        date: new Date().toISOString(), // Replace with the desired date if needed
        description: newTask.description,
        range: newTask.distance, // Assuming `range` corresponds to distance
        time: newTask.time,
        tempo: newTask.tempo,
      };
  
      // POST request to the API
      const response = await fetch('http://localhost:5000/api/activity/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(taskData),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create activity: ${response.statusText}`);
      }
  
      const createdTask = await response.json();
  
      // Update the tasks state with the newly added task
      setTasks([...tasks, { ...newTask }]);
      setNewTask({ name: '', distance: 0, description: '', tempo: 0, time: '' });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  //load activities assigned to week
  const loadWeek = async () => {
    try {
      if (!token) {
        throw new Error('No token found in localStorage.');
      }
  
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5000/api/week/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
  
      const data = await response.json();
  
      // Transform the data
      for (let day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
        if (Array.isArray(data[day]) && data[day].length > 0) {
          data[day] = data[day][0]; // Set the first item in the array for that day
        }
      }
  
      setSchedule(data); // Now assign the transformed data to setSchedule
  
    } catch (error) {
      console.error('Error initializing week:', error);
    }
  };
  

  const currentWeekDates = (() => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);

    if (dayOfWeek === 0) {
      startOfWeek.setDate(today.getDate() - 6);
    } else {
      startOfWeek.setDate(today.getDate() - (dayOfWeek - 1));
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.getDate().toString());
    }

    return dates;
  })();


  // Load schedule from localStorage on component mount
  useEffect(() => {
    fetchInitialTasks()
    loadWeek()
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (schedule !== null) {
        console.log(schedule);
        updateWeeklySchedule(schedule);
      }
    }, 500); // Delay by 500ms, adjust as needed
  
    return () => clearTimeout(timer); // Cleanup timeout on component unmount
  }, [schedule]);
  

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="week-wrapper">
        <div className="week-header">
          <div className="week-switch">
            <img src={Arrow} alt="previous week button" className="arrow1" />
            <h2>May 28 - June 4</h2>
            <img src={Arrow} alt="next week button" className="arrow2" />
          </div>
          <button className="edit-button" onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        </div>
        <div className="week">
          <div className="week-container">
            {days.map((day, index) => (
              <DaySlot
                key={day}
                day={day}
                date={currentWeekDates[index]}
                task={schedule[day]}
                isEditMode={isEditMode}
                onDrop={handleDrop}
                onDragTaskBack={handleDragTaskBack}
              />
            ))}
          </div>

          <div
            className="task-container"
            style={{ opacity: isEditMode ? 1 : 0, transition: 'opacity 0.5s ease' }}
          >
            <div className="tasks">
              {availableTasks.map((task) => (
                <Box key={task.name} task={task} isEditMode={isEditMode} />
              ))}
            </div>
            <div className="form-container add-task-form">
              <h1>Add training</h1>
              <input
                type="text"
                className="input-field"
                placeholder="Name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              />
              <input
                type="number"
                className="input-field"
                placeholder="Distance (m)"
                value={newTask.distance || ''}
                onChange={(e) => setNewTask({ ...newTask, distance: Number(e.target.value) })}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Tempo (min/km)"
                value={newTask.tempo || ''}
                onChange={(e) => setNewTask({ ...newTask, tempo: Number(e.target.value) })}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Time (minutes)"
                value={newTask.time || ''}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
              />
              <button className="add-button" onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default StravaWeek;