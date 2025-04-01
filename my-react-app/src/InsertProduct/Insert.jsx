import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Insert.module.css";

function Insert() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    tags: [],
    team: [{ name: "", position: "" }],
  });
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tags") {
      setFormData({ ...formData, tags: value.split(",").map(tag => tag.trim()).filter(tag => tag !== "") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTeamChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTeam = [...formData.team];
    updatedTeam[index][name] = value;
    setFormData({ ...formData, team: updatedTeam });
  };

  const addTeamMember = () => {
    setFormData({ ...formData, team: [...formData.team, { name: "", position: "" }] });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 1) {
      setError("Please upload at least one image.");
      return;
    }
    setImageFiles(files);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.description || formData.tags.length === 0 || imageFiles.length < 1 || !email) {
      setError("All fields and at least one image are required");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("productName", formData.productName);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("tags", JSON.stringify(formData.tags));
    formDataToSend.append("email", email);
    
    formData.team.forEach((member, index) => {
      formDataToSend.append(`team[${index}][name]`, member.name);
      formDataToSend.append(`team[${index}][position]`, member.position);
    });
    
    imageFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });
    
    try {
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      await axios.post("http://localhost:3001/add-product", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate(`/company/${email}`);
    } catch (err) {
      console.error("Error response:", err.response);
      setError("Failed to add product. Try again later.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add Product</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="productName" placeholder="Product Name" value={formData.productName} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        <input type="text" name="tags" placeholder="Tags (comma separated)" value={formData.tags.join(", ")} onChange={handleChange} required />
        
        <h3>Team Members</h3>
        {formData.team.map((member, index) => (
          <div key={index}>
            <input type="text" name="name" placeholder="Name" value={member.name} onChange={(e) => handleTeamChange(index, e)} required />
            <input type="text" name="position" placeholder="Position" value={member.position} onChange={(e) => handleTeamChange(index, e)} required />
          </div>
        ))}
        <button type="button" onClick={addTeamMember}>+ Add Team Member</button>
        
        <h3>Upload Images</h3>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} required />
        
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Insert;