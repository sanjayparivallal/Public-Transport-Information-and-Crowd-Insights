const User = require('../models/User');
const Authority = require('../models/Authority');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    if (req.user.role === 'authority') {
      const authority = await Authority.findById(req.user.id).lean();
      if (!authority) return sendError(res, 404, 'Authority profile not found');
      return sendSuccess(res, 200, authority);
    }

    const user = await User.findById(req.user.id)
      .populate('favouriteTransports', 'transportNumber name type')
      .populate('assignedTransport', 'transportNumber name type')
      .lean();

    if (!user) return sendError(res, 404, 'User not found');

    return sendSuccess(res, 200, user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    if (req.user.role === 'authority') {
      const allowedAuthFields = ['name', 'phone'];
      const updates = {};
      allowedAuthFields.forEach((f) => {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      });

      if (req.body.password) {
        const authority = await Authority.findById(req.user.id).select('+passwordHash');
        if (!authority) return sendError(res, 404, 'Authority not found');
        
        // Simple assignment; the pre-save hook in the Authority model must hash it
        authority.passwordHash = req.body.password;
        Object.assign(authority, updates);
        await authority.save();
        return sendSuccess(res, 200, { id: authority._id, name: authority.name, email: authority.email, role: 'authority' });
      }

      const authority = await Authority.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (!authority) return sendError(res, 404, 'Authority not found');
      return sendSuccess(res, 200, authority);
    }

    const allowedFields = ['name', 'phone'];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    // Allow password change
    if (req.body.password) {
      const user = await User.findById(req.user.id).select('+passwordHash');
      if (!user) return sendError(res, 404, 'User not found');
      user.passwordHash = req.body.password;
      Object.assign(user, updates);
      await user.save();
      return sendSuccess(res, 200, { id: user._id, name: user.name, email: user.email, role: user.role });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, user);
  } catch (err) {
    next(err);
  }
};

// POST /api/users/favourites/:transportId
const addFavourite = async (req, res, next) => {
  try {
    if (req.user.role !== 'commuter') {
      return sendError(res, 403, 'Only commuters can save favourite transports');
    }
    const { transportId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favouriteTransports: transportId } },
      { new: true }
    ).populate('favouriteTransports', 'transportNumber name type');

    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, user.favouriteTransports, 'Added to favourites');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/favourites/:transportId
const removeFavourite = async (req, res, next) => {
  try {
    if (req.user.role !== 'commuter') {
      return sendError(res, 403, 'Only commuters can manage favourite transports');
    }
    const { transportId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favouriteTransports: transportId } },
      { new: true }
    ).populate('favouriteTransports', 'transportNumber name type');

    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, user.favouriteTransports, 'Removed from favourites');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, addFavourite, removeFavourite };
