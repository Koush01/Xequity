const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UserModel = require("./models/User");
const ProfileInfoModel = require("./models/ProfileInfo");
const ProfilePicModel = require("./models/ProfilePic");
const ProductInfoModel = require("./models/ProductInfo");
const PostModel = require("./models/Post")

const app = express();
app.use(express.json());
app.use(cors());

// Middleware for serving uploaded profile pictures
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/Xequity", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// File upload configuration with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store uploaded files in the uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only images are allowed!"));
        }
    },
});

// ======================== AUTH ROUTES ======================== //

// Login route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ status: "Error", message: "Email not registered" });
        if (user.password !== password) return res.status(401).json({ status: "Error", message: "Invalid credentials" });

        // Fetch the user type from ProfileInfo
        const profile = await ProfileInfoModel.findOne({ email });
        const userType = profile ? profile.type : "unknown";

        res.json({ status: "Success", user: { name: user.name, email: user.email, type: userType } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ status: "Error", message: "Database error" });
    }
});

// Register route
app.post("/register", async (req, res) => {
    const { name, email, password, signupType } = req.body;
    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ status: "Error", message: "Email already registered" });

        // Determine user type based on signupType selection
        const userType = signupType === "product" ? "company" : "investor";

        // Create the user
        const user = await UserModel.create({ name, email, password });

        // Automatically create corresponding profile records
        await ProfileInfoModel.create({ email, type: userType, firstName: name });
        await ProfilePicModel.create({ email });

        res.json({ status: "Success", user });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ status: "Error", message: "Failed to create user or profile" });
    }
});

// ======================== COMMUNITY FORUM ======================== //



// Fetch all posts
app.get("/posts", async (req, res) => {
    try {
        const posts = await PostModel.find().sort({ createdAt: -1 });
        res.json({ status: "Success", posts });
    } catch (error) {
        console.error("Database fetch error:", error);  // <-- Logs the actual error
        res.status(500).json({ status: "Error", message: error.message });
    }
});


// Upvote a post

app.get("/posts/:postid/:usermail", async (req, res) => {
    try {
        const { postid, usermail } = req.params;

        const user = await ProfileInfoModel.findOne({ email: usermail });

        if (!user) {
            return res.status(404).json({ status: "Error", message: `User not found ${usermail}` });
        }

        const alreadyLiked = user.likesposts.some((post) => post.likecomp === postid);
        let count = 0;

        if (!alreadyLiked) {
            // Add post to liked list
            user.likesposts.push({ likecomp: postid });
            await user.save();

            const postinfo = await PostModel.findById(postid);
            if (!postinfo) {
                return res.status(404).json({ status: "Error", message: "Post not found" });
            }

            postinfo.upvotes += 1;
            count = postinfo.upvotes;
            await postinfo.save();

            return res.status(200).json({ status: "Success", message: "Upvoted successfully", count });
        } else {
            // Remove the like
            user.likesposts = user.likesposts.filter((post) => post.likecomp !== postid);
            await user.save();

            const postinfo = await PostModel.findById(postid);
            if (!postinfo) {
                return res.status(404).json({ status: "Error", message: "Post not found" });
            }

            postinfo.upvotes -= 1;
            count = postinfo.upvotes;
            await postinfo.save();

            return res.status(200).json({ status: "Success", message: "Upvote removed", count });
        }
    } catch (error) {
        console.error("Error updating upvotes:", error);
        res.status(500).json({ status: "Error", message: "Server Error" });
    }
});

// Add a comment to a post
app.post("/posts/:id/comment", async (req, res) => {
    const { id } = req.params;
    const { email, text } = req.body;

    if (!email || !text) {
        return res.status(400).json({ status: "Error", message: "Email and comment text are required" });
    }

    try {
        // Fetch user details to get the name
        const user = await ProfileInfoModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        // Find post and update comments
        const post = await PostModel.findByIdAndUpdate(
            id,
            { $push: { comments: { email, name: user.firstName, text } } },  // Store name
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ status: "Error", message: "Post not found" });
        }

        res.status(201).json({ status: "Success", post });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ status: "Error", message: "Failed to add comment" });
    }
});


// Fetch all comments for a specific post
app.get("/posts/:id/comments", async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id).select("comments");
        if (!post) {
            return res.status(404).json({ status: "Error", message: "Post not found" });
        }
        res.json({ status: "Success", comments: post.comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ status: "Error", message: "Failed to fetch comments" });
    }
});

// Make a post
// Create a new post with optional image upload
app.post("/create-post", upload.array("images"), async (req, res) => {
    try {
        const { email, title, content } = req.body;

        if (!email || !title || !content) {
            return res.status(400).json({ status: "Error", message: "Email, title, and content are required." });
        }

        // Fetch the user's name from ProfileInfo
        const user = await ProfileInfoModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        const imagePaths = req.files?.map(file => `http://localhost:3001/uploads/${file.filename}`) || [];

        const newPost = new PostModel({
            email,
            name: user.firstName, // Store the user's name
            title,
            content,
            image: imagePaths,
        });

        await newPost.save();

        res.status(201).json({ status: "Success", message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ status: "Error", message: "Failed to create post" });
    }
});


// ======================== PROFILE ROUTES ======================== //

// Create or update profile info
app.post("/profile", async (req, res) => {
    const { email, firstName, lastName, mobile, headline, experience, education, location, description } = req.body;

    try {
        const updateFields = {
            firstName,
            lastName,
            mobile,
            headline,
            experience,
            location,
            description,
        };

        if (education && education.length > 0) updateFields.education = education;
        if (experience && experience.length > 0) updateFields.experience = experience;

        const updatedProfile = await ProfileInfoModel.findOneAndUpdate(
            { email },
            { $set: updateFields },
            { new: true, upsert: true }
        );

        res.json({ status: "Success", profile: updatedProfile });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ status: "Error", message: "Failed to save profile information" });
    }
});

// Fetch profile picture URL by email
app.get("/profile/photo/:email", async (req, res) => {
    try {
        const profilePic = await ProfilePicModel.findOne({ email: req.params.email });
        if (!profilePic || !profilePic.profilePic) {
            return res.status(404).json({ status: "Not Found", message: "Profile picture not found" });
        }
        res.json({ status: "Success", profilePic: profilePic.profilePic });
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        res.status(500).json({ status: "Error", message: "Failed to retrieve profile picture" });
    }
});


// Fetch all profiles (investors & companies)
app.get("/profiles", async (req, res) => {
    try {
        const profiles = await ProfileInfoModel.find();
        res.json({ status: "Success", profiles });
    } catch (error) {
        console.error("Error fetching profiles:", error);
        res.status(500).json({ status: "Error", message: "Failed to fetch profiles" });
    }
});
// fetching profile of investors
app.get("/profile/:email", async (req, res) => {
    try {
        const profile = await ProfileInfoModel.findOne({ email: req.params.email });
        if (!profile) {
            return res.status(404).json({ status: "Error", message: "profile not found" });
        }
        res.json({ status: "Success", profile });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});
// Handle profile photo upload
app.post("/profile/upload", upload.single("profilePic"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ status: "Error", message: "No file uploaded" });

        const { email } = req.body;
        const profilePicPath = `http://localhost:3001/uploads/${req.file.filename}`;

        // Delete old profile picture if it exists
        const oldProfile = await ProfilePicModel.findOne({ email });
        if (oldProfile && oldProfile.profilePic) {
            const oldFilePath = path.join(__dirname, oldProfile.profilePic.replace("http://localhost:3001/", ""));
            if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        }

        const updatedProfile = await ProfilePicModel.findOneAndUpdate(
            { email },
            { profilePic: profilePicPath },
            { upsert: true, new: true }
        );

        res.status(200).json({ status: "Success", profilePic: updatedProfile });
    } catch (error) {
        console.error("Profile picture upload error:", error);
        res.status(500).json({ status: "Error", message: "Failed to upload profile picture" });
    }
});


// Fetch profile picture URL by email
app.get("/profile-pic/:email", async (req, res) => {
    try {
        const profilePic = await ProfilePicModel.findOne({ email: req.params.email });
        if (!profilePic || !profilePic.profilePic) {
            return res.status(404).json({ status: "Not Found", message: "Profile picture not found" });
        }
        res.json({ status: "Success", profilePic: profilePic.profilePic });
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        res.status(500).json({ status: "Error", message: "Failed to retrieve profile picture" });
    }
});

// ======================== PRODUCTS ROUTES ======================== //

// Insert a new product (allows flexible image upload)
app.post("/add-product", upload.array("images"), async (req, res) => {
    // console.log("Uploaded files:", req.files);  // Log files to check if they're uploaded
   
    const { productName, description, tags, team, email } = req.body;

    if (!productName || !description || !tags || !email) {
        return res.status(400).json({ status: "Error", message: "Product name, description, tags, and email are required." });
    }

    // Ensure at least one image is uploaded
    const imagePaths = req.files?.map(file => `http://localhost:3001/uploads/${file.filename}`) || [];
    if (imagePaths.length === 0) {
        return res.status(400).json({ status: "Error", message: "At least one image is required." });
    }

    try {
        const newProduct = new ProductInfoModel({ 
            productName, 
            description, 
            tags, 
            team, // Ensure team data is parsed correctly
            images: imagePaths, 
            email 
        });
        {console.log(newProduct)};
        await newProduct.save();
        res.json({ status: "Success", message: "Product added successfully" });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ status: "Error", message: "Failed to add product", error: error.message });
    }
});

// Fetch all products (only for companies)
app.get("/products", async (req, res) => {
    try {
        const companies = await ProfileInfoModel.find({ type: "company" }, "email");
        const companyEmails = companies.map(c => c.email);
        const products = await ProductInfoModel.find({ email: { $in: companyEmails } });

        res.json({ status: "Success", products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ status: "Error", message: "Failed to fetch products" });
    }
});

app.get("/product/:email/:usermail", async (req, res) => {
    try {
        const { email, usermail } = req.params;

        const gproduct = await ProfileInfoModel.findOne({
            email: usermail,
            likes: { $elemMatch: { likecomp: email } }
        });

        let count;

        if (!gproduct) {
            const user = await ProfileInfoModel.findOne({ email: usermail });

            if (!user) {
                return res.status(404).json({ message: `User not found ${usermail}` });
            }

            user.likes.push({ likecomp: email });
            await user.save();

            // Update upvote count
            const compinfo = await ProductInfoModel.findOne({ email: email });

            if (!compinfo) {
                return res.status(404).json({ message: "Company not found" });
            }

            compinfo.upvote += 1;
            count = compinfo.upvote;
            await compinfo.save();

            return res.status(200).json({ message: "Like added successfully", count });
        } else {
            // User already liked, so REMOVE like
            await ProfileInfoModel.findOneAndUpdate(
                { email: usermail },
                { $pull: { likes: { likecomp: email } } }
            );

            const compinfo = await ProductInfoModel.findOne({ email: email });

            if (!compinfo) {
                return res.status(404).json({ message: "Company not found" });
            }

            compinfo.upvote -= 1;
            count = compinfo.upvote;
            await compinfo.save();

            return res.status(200).json({ message: "Like removed successfully", count });
        }
    } catch (error) {
        console.error("Error updating likes:", error);
        res.status(500).json({ message: "Server Error" });
    }
});



// Fetch products for a specific company
app.get("/products/:email", async (req, res) => {
    try {
        const products = await ProductInfoModel.find({ email: req.params.email });
        res.json({ status: "Success", products });
    } catch (error) {
        console.error("Error fetching company products:", error);
        res.status(500).json({ status: "Error", message: "Failed to fetch products" });
    }
});

// Fetch a single product by ID
app.get("/product/:email", async (req, res) => {
    try {
        const product = await ProductInfoModel.find({ email: req.params.email });
        if (!product) {
            return res.status(404).json({ status: "Error", message: "Product not found" });
        }
        res.json({ status: "Success", product });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

// ======================== SERVER START ======================== //

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});
