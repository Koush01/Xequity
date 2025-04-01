import React , {useState} from "react";
import styles from "./Login.module.css";
import Login_icon from '../assets/Investor.png'; 
import Email_icon from '../assets/emailIcon.png'; 
import Password_icon from '../assets/password_icon.png'; 
import axios from 'axios'
import {useNavigate} from "react-router-dom";
function Login({ setIsLoggedIn, setUserData }) { // Accept props
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (email) {
            axios.post("http://localhost:3001/login", { email, password })
                .then(response => {
                    if (response.data.status === "Success") {
                        setIsLoggedIn(true); // Set user as logged in
                        setUserData({
                            name: response.data.user.name,
                            email: response.data.user.email,
                            type: response.data.user.type // Store the user type
                        });
                        navigate('/product'); // Navigate to the product page
                    } else {
                        alert(response.data); // Show an error message
                    }
                })
                .catch(err => {
                    console.error("Error:", err.message);
                    alert("An error occurred while logging in.");
                });
        } else {
            alert("Please enter your email");
        }
    };
    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.text}>Log in</div>
                <div className={styles.underline}></div>
            </div>
            <div className={styles.inputs}>
                <div className={styles.input}>
                    <img  className={styles.iccon} src={Email_icon} alt="" style={{ height: '20px', width: 'auto' }} />
                    <input
                        type="email"
                        placeholder="Email ID"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className={styles.input}>
                    <img src={Password_icon} className={styles.iccon} alt="" style={{ height: '25px', width: 'auto' }}  />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>
            <div className={styles.forgot}>Lost Password! Click here.</div>
            <div className={styles.submit_container}>
                <div className={styles.submit} onClick={handleSubmit}>
                    Login
                </div>
            </div>
        </div>
    );
}

export default Login;
