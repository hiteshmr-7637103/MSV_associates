import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Staff from './models/Staff.js';
import Task from './models/Task.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_DB_PATH = path.join(__dirname, 'local_db.json');

let isMongoConnected = false;

// Initial seed data for MSV Associates
const INITIAL_STAFF = [
  { name: 'Singaravel', role: 'Staff', workBlock: 'current_work', avatarColor: '#ec4899' },
  { name: 'Suguna', role: 'Staff', workBlock: 'current_work', avatarColor: '#a855f7' },
  { name: 'Staff 1', role: 'Staff', workBlock: 'intermediate_work', avatarColor: '#3b82f6' },
  { name: 'Staff 2', role: 'Staff', workBlock: 'intermediate_work', avatarColor: '#10b981' },
  { name: 'Outerworks Staff', role: 'Outerworks Staff', workBlock: 'outerworks', avatarColor: '#f59e0b' },
  { name: 'MSV Admin', role: 'Admin', workBlock: 'intermediate_work', avatarColor: '#ef4444' }
];

const INITIAL_TASKS = [
  {
    title: 'Amount collection - Policy #MC-9081',
    description: 'Collect premium amount of 12,500 INR from client John Doe for his motor insurance policy.',
    status: 'todo',
    assignedStaff: null,
    checklists: [
      { text: 'Call client to verify availability', completed: true },
      { text: 'Visit client address', completed: false },
      { text: 'Collect cheque and provide receipt', completed: false }
    ],
    policyType: 'Motor',
    policyNumber: 'MC-9081',
    clientName: 'John Doe',
    amount: 12500,
    unstructuredData: {
      vehicleNumber: 'TN-01-AB-1234',
      vehicleModel: 'Honda City',
      collectionAddress: '12 Main Street, Chennai'
    },
    priority: 'high'
  },
  {
    title: 'Health Policy Endorsement - Suguna',
    description: 'Process health policy endorsement for adding spouse details to policy #HP-5542.',
    status: 'current_work',
    assignedStaff: 'Suguna', // Will be resolved to ID later
    checklists: [
      { text: 'Verify marriage certificate', completed: true },
      { text: 'Update database record', completed: true },
      { text: 'Send confirmation letter', completed: false }
    ],
    policyType: 'Health',
    policyNumber: 'HP-5542',
    clientName: 'Sarah Smith',
    amount: 0,
    unstructuredData: {
      spouseName: 'Robert Smith',
      hospitalNetworkCover: 'Star Health Network'
    },
    priority: 'medium'
  }
];

export const setMongoConnectedStatus = (status) => {
  isMongoConnected = status;
};

// Helper for local JSON database file reading/writing
const readLocalDB = () => {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const defaultData = { staff: [], tasks: [] };
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local JSON database:', error);
    return { staff: [], tasks: [] };
  }
};

const writeLocalDB = (data) => {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing local JSON database:', error);
  }
};

// Seed function for MongoDB and JSON database
export const seedDB = async () => {
  if (isMongoConnected) {
    try {
      const staffCount = await Staff.countDocuments();
      if (staffCount === 0) {
        console.log('Seeding initial staff to MongoDB...');
        const createdStaff = await Staff.insertMany(INITIAL_STAFF);
        
        // Seed initial tasks, mapping the mock staff name to actual MongoDB ObjectId
        const taskCount = await Task.countDocuments();
        if (taskCount === 0) {
          console.log('Seeding initial tasks to MongoDB...');
          const tasksToSeed = INITIAL_TASKS.map(task => {
            if (task.assignedStaff) {
              const matchedStaff = createdStaff.find(s => s.name === task.assignedStaff);
              return { ...task, assignedStaff: matchedStaff ? matchedStaff._id : null };
            }
            return task;
          });
          await Task.insertMany(tasksToSeed);
        }
      }
    } catch (error) {
      console.error('MongoDB seeding failed:', error);
    }
  } else {
    // Local JSON Database Seeding
    const data = readLocalDB();
    if (!data.staff || data.staff.length === 0) {
      console.log('Seeding initial staff to Local JSON file...');
      data.staff = INITIAL_STAFF.map((s, idx) => ({
        _id: `staff_${Date.now()}_${idx}`,
        ...s,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      console.log('Seeding initial tasks to Local JSON file...');
      data.tasks = INITIAL_TASKS.map((t, idx) => {
        let staffId = null;
        if (t.assignedStaff) {
          const matchedStaff = data.staff.find(s => s.name === t.assignedStaff);
          staffId = matchedStaff ? matchedStaff._id : null;
        }
        return {
          _id: `task_${Date.now()}_${idx}`,
          ...t,
          assignedStaff: staffId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
      writeLocalDB(data);
    }
  }
};

// --- STAFF REPOSITORY ACTIONS ---
export const getAllStaff = async () => {
  if (isMongoConnected) {
    return await Staff.find({});
  } else {
    const data = readLocalDB();
    return data.staff || [];
  }
};

export const createStaff = async (staffData) => {
  if (isMongoConnected) {
    const newStaff = new Staff(staffData);
    return await newStaff.save();
  } else {
    const data = readLocalDB();
    const newStaff = {
      _id: `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...staffData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.staff.push(newStaff);
    writeLocalDB(data);
    return newStaff;
  }
};

// --- TASK REPOSITORY ACTIONS ---
export const getAllTasks = async () => {
  if (isMongoConnected) {
    return await Task.find({}).populate('assignedStaff');
  } else {
    const data = readLocalDB();
    // Populate assignedStaff manually for local file fallback
    return (data.tasks || []).map(task => {
      const staffInfo = data.staff.find(s => s._id === task.assignedStaff);
      return {
        ...task,
        assignedStaff: staffInfo || null
      };
    });
  }
};

export const createTask = async (taskData) => {
  if (isMongoConnected) {
    const newTask = new Task(taskData);
    return await newTask.save();
  } else {
    const data = readLocalDB();
    const newTask = {
      _id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'todo',
      assignedStaff: taskData.assignedStaff || null,
      checklists: taskData.checklists || [],
      policyType: taskData.policyType || 'General',
      policyNumber: taskData.policyNumber || '',
      clientName: taskData.clientName || '',
      amount: taskData.amount || 0,
      unstructuredData: taskData.unstructuredData || {},
      priority: taskData.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.tasks.push(newTask);
    writeLocalDB(data);
    return newTask;
  }
};

export const updateTask = async (id, taskData) => {
  if (isMongoConnected) {
    return await Task.findByIdAndUpdate(id, taskData, { new: true }).populate('assignedStaff');
  } else {
    const data = readLocalDB();
    const taskIndex = data.tasks.findIndex(t => t._id === id);
    if (taskIndex === -1) throw new Error('Task not found');
    
    data.tasks[taskIndex] = {
      ...data.tasks[taskIndex],
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    writeLocalDB(data);
    
    // return populated task
    const updated = data.tasks[taskIndex];
    const staffInfo = data.staff.find(s => s._id === updated.assignedStaff);
    return {
      ...updated,
      assignedStaff: staffInfo || null
    };
  }
};

export const deleteTask = async (id) => {
  if (isMongoConnected) {
    return await Task.findByIdAndDelete(id);
  } else {
    const data = readLocalDB();
    const taskIndex = data.tasks.findIndex(t => t._id === id);
    if (taskIndex === -1) throw new Error('Task not found');
    const deleted = data.tasks.splice(taskIndex, 1)[0];
    writeLocalDB(data);
    return deleted;
  }
};
