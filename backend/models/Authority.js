const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authoritySchema = new mongoose.Schema(
  {
    // --- Auth fields (Authority is a standalone identity, not linked to users) ---
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    refreshTokenHash: { type: String, select: false, default: null },

    // --- Organisation details ---
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    authorityCode: {
      type: String,
      required: [true, 'Authority code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
    },
    coveredDistricts: [{ type: String, trim: true }],
    contactEmail:  { type: String, trim: true, lowercase: true },
    contactPhone:  { type: String, trim: true },
    officeAddress: { type: String, trim: true },

    // --- Managed resources ---
    managedTransports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transport' }],
    managedDrivers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    managedConductors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Hash password before saving
authoritySchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

authoritySchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

module.exports = mongoose.model('Authority', authoritySchema);
