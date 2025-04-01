const mongoose = require("mongoose");

// Define the TeamMember schema (name and position for each team member)
const TeamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
});

// Define the ProductInfo schema
const ProductInfoSchema = new mongoose.Schema({
    productName: { type: String, required: true },         // Product name
    description: { type: String, required: true },         // Product description
    tags: { type: [String], required: true },              // Array of tags for the product
    team: { type: [TeamMemberSchema], required: true },    // Array of team members (name and position)
    images: { type: [String], required: true },            // Array of image URLs for the product
    email: { type: String, unique: true, required: true },  // Email of the user uploading the product (unique)
    upvote: { type: Number, default:0 }                     //Count of upvote
});

// Create the ProductInfo model
const ProductInfoModel = mongoose.model("ProductInfo", ProductInfoSchema);

module.exports = ProductInfoModel;
