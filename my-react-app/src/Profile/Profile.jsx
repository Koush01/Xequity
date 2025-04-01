import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./Profile.module.css";
import myImage from "../assets/Investor.png";

function Profile() {
    const { email } = useParams(); // Get the email from the route parameter
    const [isEditing, setIsEditing] = useState(false);

    const [profilePic, setProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    // Fetch the profile picture when the component mounts
    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/profile/photo/${email}`);
        if (response.data.profilePic) {
          setProfilePic(response.data.profilePic);
        }
      } catch (err) {
        console.error("Failed to fetch profile picture:", err);
      }
    };

    fetchProfilePic();
  }, [email]);
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an image to upload");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", selectedFile);
    formData.append("email", email);

    try {
      const response = await axios.post("http://localhost:3001/profile/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "Success") {
        setProfilePic(response.data.profilePic.profilePic);  // Update profile pic in the state
        setUploadStatus("Profile picture uploaded successfully!");
      } else {
        setUploadStatus("Failed to upload profile picture");
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setUploadStatus("Error uploading profile picture");
    }
  };


    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: email,
        mobile: "",
        headline: "",
        experience: [], // Array for experience
        education: [], // Array for education
        location: "",
        description: "",
    });

    const [newEducation, setNewEducation] = useState({
        schoolName: "",
        startYear: "",
        endYear: "",
        courseName: "",
    });

    const [newExperience, setNewExperience] = useState({
        companyName: "",
        role: "",
        startYear: "",
        endYear: "",
    });

    useEffect(() => {
        if (email) {
            axios
                .get(`http://localhost:3001/profile/${email}`)
                .then((response) => {
                    if (response.data.status === "Success" && response.data.profile) {
                        setFormData(response.data.profile);
                    }
                })
                .catch((err) => console.error("Error fetching profile:", err));
        }
    }, [email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEducationChange = (e) => {
        const { name, value } = e.target;
        setNewEducation((prev) => ({ ...prev, [name]: value }));
    };

    const handleExperienceChange = (e) => {
        const { name, value } = e.target;
        setNewExperience((prev) => ({ ...prev, [name]: value }));
    };

    const addEducation = () => {
        setFormData((prev) => ({
            ...prev,
            education: [...prev.education, newEducation],
        }));
        setNewEducation({ schoolName: "", startYear: "", endYear: "", courseName: "" });
    };

    const addExperience = () => {
        setFormData((prev) => ({
            ...prev,
            experience: [...prev.experience, newExperience],
        }));
        setNewExperience({ companyName: "", role: "", startYear: "", endYear: "" });
    };

    const handleSave = () => {
        axios
            .post("http://localhost:3001/profile", formData)
            .then((response) => {
                if (response.data.status === "Success") {
                    setIsEditing(false);
                }
            })
            .catch((err) => console.error("Error saving profile:", err));
    };

    return (
        <div className={styles.profileContainer} >
            {/* Left Panel */}
            <div className={styles.leftPanel}>
            <h2>Profile Picture</h2>

            {profilePic ? (
          <img src={profilePic} alt="Profile" className={styles.aboutImage}/>
        ) : (
            <img src={myImage} alt="Investor" className={styles.aboutImage} />
        )}


{uploadStatus && <p>{uploadStatus}</p>}
                
                <h2>User Details</h2>
                <ul className={styles.userInfo}>
                    <li>
                        <span className={styles.label}>Name:</span>
                        <span className={styles.value}>{formData.firstName || "Guest"}</span>
                    </li>
                    <li>
                        <span className={styles.label}>Email:</span>
                        <span className={styles.value}>{formData.email}</span>
                    </li>
                </ul>
                <form onSubmit={handleUpload}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="submit">Upload Profile Picture</button>
        </form>
        
            </div>

            {/* Right Panel */}
            <div className={styles.rightPanel}>
                <h3>Welcome to your profile page!</h3>

                {!isEditing ? (
                    <>
                        <div className={styles.detailsSection}>
                            <div>
                                <h4 className={styles.sectionHeading}>First Name</h4>
                                <div className={styles.sectionData}>{formData.firstName || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Last Name</h4>
                                <div className={styles.sectionData}>{formData.lastName || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Mobile</h4>
                                <div className={styles.sectionData}>{formData.mobile || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Headline</h4>
                                <div className={styles.sectionData}>{formData.headline || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Experience</h4>
                                <div className={styles.sectionData}>
                                {formData.experience.length > 0 ? (
                                    <ul>
                                        <div className={styles.educationList}>

                                        {formData.experience.map((exp, index) => (
                                            <li key={index} className={styles.education}>
                                                {exp.companyName} ({exp.startYear} - {exp.endYear}) - {exp.role}
                                            </li>
                                        ))}
                                        </div>
                                    </ul>
                                ) : (
                                    <div className={styles.sectionData}>N/A</div>
                                )}
                                </div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Education</h4>
                                <div className={styles.sectionData}>
                                {formData.education.length > 0 ? (
                                    <ul>
                                        <div className={styles.educationList}>
                                        {formData.education.map((edu, index) => (
                                            <li key={index} className={styles.education}>
                                                {edu.schoolName} ({edu.startYear} - {edu.endYear}) - {edu.courseName}
                                            </li>
                                        ))}</div>
                                    </ul>
                                ) : (
                                    <div className={styles.sectionData}>N/A</div>
                                )}
                                </div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Location</h4>
                                <div className={styles.sectionData}>{formData.location || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Description</h4>
                                <div className={styles.sectionData}>{formData.description || "N/A"}</div>
                            </div>
                        </div>

                        <div className={styles.editbutn}>
                        <button onClick={() => setIsEditing(true)} className={styles.updateButton}>
                            Edit
                        </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.editableSection}>
                        <form>
                            <label>
                                <h4 className={styles.sectionHeading}>First Name:</h4>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
                            </label>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Last Name:</h4>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                            </label>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Mobile:</h4>
                                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} />
                            </label>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Headline:</h4>
                                <input type="text" name="headline" value={formData.headline} onChange={handleChange} />
                            </label>
                            <br />
                            <h4 className={styles.sectionHeading}>Add Experience:</h4>
                            <label>
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="Company Name"
                                    value={newExperience.companyName}
                                    onChange={handleExperienceChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="role"
                                    placeholder="Role"
                                    value={newExperience.role}
                                    onChange={handleExperienceChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="startYear"
                                    placeholder="Start Year"
                                    value={newExperience.startYear}
                                    onChange={handleExperienceChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="endYear"
                                    placeholder="End Year"
                                    value={newExperience.endYear}
                                    onChange={handleExperienceChange}
                                />
                            </label>
                            <button type="button" onClick={addExperience} className={styles.addButton}>
                                Add Experience
                            </button>
                            <br />
                            <h4 className={styles.sectionHeading}>Add Education:</h4>
                            <label>
                                <input
                                    type="text"
                                    name="schoolName"
                                    placeholder="School Name"
                                    value={newEducation.schoolName}
                                    onChange={handleEducationChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="startYear"
                                    placeholder="Start Year"
                                    value={newEducation.startYear}
                                    onChange={handleEducationChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="endYear"
                                    placeholder="End Year"
                                    value={newEducation.endYear}
                                    onChange={handleEducationChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="courseName"
                                    placeholder="Course Name"
                                    value={newEducation.courseName}
                                    onChange={handleEducationChange}
                                />
                            </label>
                            <button type="button" onClick={addEducation} className={styles.addButton}>
                                Add Education
                            </button>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Location:</h4>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} />
                            </label>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Description:</h4>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                />
                            </label>
                            <br />
                            <button type="button" onClick={handleSave} className={styles.saveButton}>
                                Save
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
