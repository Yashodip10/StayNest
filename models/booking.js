const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
{
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    bookingDate: {
        type: Date,
        default: Date.now,
    },

    status: {
        type: String,
        default: "Confirmed",
    },
});

module.exports = mongoose.model("Booking", bookingSchema);