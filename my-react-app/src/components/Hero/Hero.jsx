import React, { useEffect, useState } from "react";
import styles from "./Hero.module.css";
import axios from "axios";  // Import axios for making API calls

export const Hero = ({ email, name, description }) => {
  const [profilePic, setProfilePic] = useState("");  // State to store the profile picture URL
  const [loading, setLoading] = useState(true);  // State to track loading state

  useEffect(() => {
    // Fetch profile picture based on email when component mounts
    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/profile/photo/${email}`);
        setProfilePic(response.data.profilePic);  // Set the fetched profile picture URL
        setLoading(false);  // Set loading to false once data is fetched
      } catch (error) {
        console.error("Error fetching profile picture:", error);
        setLoading(false);  // Stop loading in case of error
      }
    };

    fetchProfilePic();
  }, [email]);  // Run the effect when email changes

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.description}>{description}</p>
        
        <div className={styles.investor_type}>
          <div className={styles.investor_list}>
            <button className={styles.tag}>Angel Investor</button>
            <button className={styles.tag}>Venture Capitalist</button>
            <button className={styles.tag}>Corporate Investor</button>
            <button className={styles.tag}>Hedge Fund</button>
            <button className={styles.tag}>Impact Investor</button>
          </div>
        </div>
        
        <a href={`mailto:${email}`} className={styles.contactBtn}>
          Connect +
        </a>
      </div>

      {/* Display profile picture or loading state */}
      {loading ? (
        <div className={styles.heroImg}>Loading...</div>
      ) : (
        <img
          src={profilePic || "http://localhost:3001/uploads/Investor.jpg"}  // Default to Investor.jpg if no profilePic
          alt="Profile"
          className={styles.heroImg}
        />
      )}
      
      <div className={styles.topBlur} />
      <div className={styles.bottomBlur} />
    </section>
  );
};
