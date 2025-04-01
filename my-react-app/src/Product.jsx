import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import myImage from "./assets/Product.gif"; 
import pfp from "../assests/propfp.jpg"; 
import pfp2 from "../assests/propfp2.jpg"; 
import styles from "./Product.module.css";

function Product({ useremail }) {
    const [products, setProducts] = useState([]);
    const [counts, setCounts] = useState({});
    // const { useremail } = useParams(); // Get logged-in user's email from URL params

    // Fetch products from the backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:3001/products"); // Fetch all products
                const data = await response.json();
                if (data.status === "Success") {
                    setProducts(data.products);
                    const initialCounts = {};
                    data.products.forEach(product => {
                        initialCounts[product.email] = product.upvote || 0; // Initialize upvote count
                    });
                    setCounts(initialCounts);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };
        
        fetchProducts();
    }, []);

    // Function to handle upvote (like/unlike)
    const incrementCount = async (email) => {
      if (!useremail) {
          console.error("User email is undefined. Cannot proceed with upvote.");
          return;
      }
  
      try {
          const response = await fetch(`http://localhost:3001/product/${email}/${useremail}`, {
              method: "GET",
          });
  
          const data = await response.json();
          if (data.count !== undefined) {
              setCounts(prevCounts => ({
                  ...prevCounts,
                  [email]: data.count,
              }));
          }
      } catch (error) {
          console.error("Error updating upvote:", error);
      }
  };
  

    return (
        <div className={styles.Body}> 
            <div>
                <section className={styles.container}>
                    {/* Map over the fetched products */}
                    {products.map((product, index) => (
                        <div key={product.email} className={styles.card}>
                            <Link to={`/ProductPage/${product.email}`} className={styles.detailsLink}>
                                <div className={styles.content}>
                                    <div className={styles.logo}>
                                        <img src={product.images[0]} alt="Product Image" className={styles.aboutImage} />
                                    </div>
                                    <div className={styles.specification}>
                                        <ul className={styles.aboutItems}>
                                            <li className={styles.aboutItem}>
                                                <div className={styles.aboutItemText}>
                                                    <h2>{product.productName}</h2>
                                                    <p>{product.description}</p>
                                                    <p>{product.tags.join(', ')}</p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Link>
                            {/* Upvote button */}
                            <button className={styles.incrementButton} onClick={() => incrementCount(product.email)}>
                                {counts[product.email]}
                            </button>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}

export default Product;
