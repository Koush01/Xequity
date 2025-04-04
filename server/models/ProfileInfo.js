const mongoose = require("mongoose");

const ProfileInfoSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true }, // Ensure email is unique and required
    mobile: String,
    headline: String,
    type: { type: String, enum: ["company", "investor"], required: true }, // Type field with enum constraint
    experience: [
        {
            companyName: { type: String },
            role: { type: String },
            startYear: { type: Number },
            endYear: { type: Number },
        },
    ], // Array for multiple experiences
    education: [
        {
            schoolName: { type: String },
            startYear: { type: Number },
            endYear: { type: Number },
            courseName: { type: String },
        },
    ],
    location: String,
    description: String,
    likes: [
        {
            likecomp: { type: String }
        }
    ],
    likesposts: [
        {
            likecomp: { type: String }
        }
    ],
    comments: [
        {
            postId: String,
            comment: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    tags: {
        type: [String], 
        
    } // Array of tags, each of type String
});

const ProfileInfoModel = mongoose.model("ProfileInfo", ProfileInfoSchema);

module.exports = ProfileInfoModel;
