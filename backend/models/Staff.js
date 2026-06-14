import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Staff', 'Outerworks Staff'],
    default: 'Staff'
  },
  workBlock: {
    type: String,
    enum: ['current_work', 'intermediate_work', 'outerworks'],
    required: true
  },
  avatarColor: {
    type: String,
    default: '#3b82f6'
  }
}, { timestamps: true });

export default mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
