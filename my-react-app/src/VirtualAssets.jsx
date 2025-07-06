import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./VirtualAssets.module.css"; // Import CSS for styling
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';


const VirtualAssets = () => {
   const [assets, setAssets] = useState([]);
   const navigate = useNavigate();
   const location = useLocation();
   const userEmail = location.state?.userEmail;
    {console.log(userEmail)}
   useEffect(() => {
       axios.get("http://localhost:3001/api/virtual-assets")
           .then((response) => {
               setAssets(response.data);
           })
           .catch((error) => {
               console.error("Error fetching virtual assets:", error);
           });
   }, []);
 
   const handleCardClick = (email) => {
    if (email) {
        navigate(`/TokenPage/${email}`, {
            state: {
                 userEmail, // Pass the logged-in user's email
            },
        });
    } else {
        console.error("No email found for this asset.");
    }
};
 




   return (
       <div className={styles.container}>
           <div className={styles.grid}>
               {assets.length > 0 ? (
                   assets.map((asset) => (
                       <div
                           key={asset._id}
                           className={styles.card}
                           onClick={() => handleCardClick(asset.email)} // Navigate on click
                           style={{ cursor: "pointer" }}
                       >
                           <div className={styles.imageContainer}>
                               <img src={asset.image} alt={asset.TokenName} className={styles.image} />
                           </div>
                           <div className={styles.details}>
                               <h2>{asset.TokenName}</h2>
                               <p><strong>Price:</strong> {asset.CurrentPrice ? asset.CurrentPrice : "--"}</p>
                           </div>
                       </div>
                   ))
               ) : (
                   <p>No Virtual Assets Found</p>
               )}
           </div>
       </div>
   );
};




export default VirtualAssets;













