import mongoose, { Schema } from "mongoose";

const schama = new Schema(
    {
        // cId: mongoose.Schema.Types.ObjectId,
        firstName: {
            type: String,
            // required: true,
        },
        lastName: {
            type: String,
            // required: true,
        },
        imageUrl: {
            type: String,
            // unique: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            // required: true,
        },
        password: {
            type: String,
            // required: true,
        },
        type: {
            type: String,
            // required: true,
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        sex: {
            type: String,
        },
        data:{
            type: Object,
        },

    },
    {
        timestamps: true,
    }
);
// schama.index({ email: 1 }, { unique: true });
// schama.index({ phone: 1 }, { unique: true });
const User = mongoose.models.User || mongoose.model("User", schama);

export default User;