const mongoose = require("mongoose");

const SaleBidSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Product Email
    name: { type: String, required: true, unique: true },
    bids: [
        {
            quantity: { type: Number, default: 0, required: true }, 
            price: {type: Number},
        }
    ]
});

const SaleBidModel = mongoose.model("SaleBid", SaleBidSchema);
module.exports = SaleBidModel;