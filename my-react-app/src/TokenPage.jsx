import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./TokenPage.module.css";
import { Link ,useLocation} from "react-router-dom"

const TokenPage = () => {
    const { email } = useParams();
    const [tokenData, setTokenData] = useState(null);
    const [productData, setProductData] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:3001/api/virtual-assets-with-product/${email}`)
            .then(response => {
                setTokenData(response.data.token);
                setProductData(response.data.product);
            })
            .catch(error => {
                console.error("Error fetching token and product data:", error);
            });
    }, [email]);


    if (!tokenData) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <img src={tokenData.image} alt={tokenData.TokenName} className={styles.tokenImage} />
                <div className={styles.tokenInfo}>
                    <h1 className = {styles.tokenamestyle}>{tokenData.TokenName}</h1>
                    <p className={styles.price}><strong>Price:</strong> {tokenData.CurrentPrice ? tokenData.CurrentPrice : "--"}</p>
                </div>
            </div>
            <div className={styles.overview}>
                <h2>Overview</h2>
                <p><strong>Number of Tokens Issued:</strong> {tokenData.NumberOfIssue}</p>
                <p><strong>Equity Diluted:</strong> {tokenData.EquityDiluted}%</p>
                <Link to={`/ProductPage/${productData.email}`} className={styles.detailsLink} key={productData.email}>
                    <div className={styles.content}>
                        <div className={styles.logo}>
                            <img src={productData.images?.[0]} alt="Product Image" className={styles.aboutImage} />
                        </div>
                        <div className={styles.specification}>
                            <ul className={styles.aboutItems}>
                                <li className={styles.aboutItem}>
                                    <div className={styles.aboutItemText}>
                                        <h2>{productData.productName}</h2>
                                        <p>{productData.description}</p>
                                        <p><strong>Tags:</strong> {productData.tags?.join(", ")}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default TokenPage;
