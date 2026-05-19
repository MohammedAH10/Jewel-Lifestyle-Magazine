import mongoose from 'mongoose';

const storySubmissionSchema = new mongoose.Schema({
  submitter_name: { type: String, required: true },
  submitter_email: { type: String, required: true },
  submitter_phone: String,
  story_title: { type: String, required: true },
  story_type: {
    type: String,
    enum: ['Executive Interview', 'Lifestyle Feature', 'Business Story', 'Event Coverage', 'Other'],
  },
  story_description: { type: String, required: true },
  attachment_url: String,
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
    default: 'Pending',
  },
}, { timestamps: true });

export default mongoose.model('StorySubmission', storySubmissionSchema);
