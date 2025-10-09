const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payeeName: { type: String, required: true, maxlength: 100 },
    payeeAccount: { type: String, required: true },
    swift: { type: String, required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    reference: { type: String, maxlength: 140 },
    status: { type: String, enum: ['pending','verified','sent'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure sensitive fields not leaked accidentally
paymentSchema.methods.toRedactedJSON = function() {
    return {
        id: this._id,
        payeeName: this.payeeName,
        amount: this.amount,
        currency: this.currency,
        reference: this.reference,
        status: this.status,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('Payment', paymentSchema);