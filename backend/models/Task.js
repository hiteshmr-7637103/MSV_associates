import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['todo', 'current_work', 'intermediate_work', 'outerworks', 'done'],
    default: 'todo'
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  checklists: [
    {
      text: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ],
  policyType: {
    type: String,
    default: 'General'
  },
  policyNumber: {
    type: String,
    default: ''
  },
  clientName: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    default: 0
  },
  // This supports unstructured, arbitrary data for varying policies
  unstructuredData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
