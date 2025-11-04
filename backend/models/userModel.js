const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true },
    accountNumber: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'employee', 'admin'], default: 'customer' },
    is2FAEnabled: { type: Boolean, default: false },
    twoFASecret: { type: String }, // base32 secret
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Do not return sensitive fields in JSON
userSchema.methods.toSafeJSON = function () {
    return {
        id: this._id,
        fullName: this.fullName,
        email: this.email,
        accountNumber: this.accountNumber,
        role: this.role,
        is2FAEnabled: this.is2FAEnabled,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('User', userSchema);

