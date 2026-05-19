import mongoose from 'mongoose';

const awardNominationSchema = new mongoose.Schema({
  nominee_name: { type: String, required: true },
  nominee_title: String,
  nominee_company: String,
  award_category: { type: String, required: true },
  nominator_name: { type: String, required: true },
  nominator_email: { type: String, required: true },
  reason: { type: String, required: true },
  supporting_links: String,
  year: Number,
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Shortlisted', 'Winner', 'Not Selected'],
    default: 'Pending',
  },
}, { timestamps: true });

export default mongoose.model('AwardNomination', awardNominationSchema);
