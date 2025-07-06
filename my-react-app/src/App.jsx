import Profile from "./Profile/Profile";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Headbar from "./Headbar";
import Product from "./Product";
import ProductPage from "./ProductPage";
import Login from "./Login/Login";
import Investor from "./Investor";
import InvestorPage from "./InvestorPage";
import SignUp from "./SignUP/SignUp";
import Footer from './Footer';
import Company from "./Company/Company";
import Insert from "./InsertProduct/Insert";
import Forum from "./Forum";
import InvestorsByTag from "./InvestorsByTag";
import ProductsByTag from "./ProductsByTag";
import CreatePost from "./CreatePost";
import Update from "./Company/Update";
import MyInvestment from "./MyInvestment";
import VirtualAssets from "./VirtualAssets";
import TokenPage from "./TokenPage";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);


  return (
    <Router>
      <Headbar
        isLoggedIn={isLoggedIn}
        userName={userData?.name || "Guest"}
        setUserName={(name) => setUserData((prev) => ({ ...prev, name }))}
        setIsLoggedIn={setIsLoggedIn}
        userData={userData}
      />
      <Routes>
        <Route path="/InvestorPage/:email" element={<InvestorPage />} />
        <Route path="/" element={isLoggedIn ? <Forum useremail={userData?.email} username={userData?.name} /> : <Navigate to="/register" />} />
        <Route path="/register" element={<SignUp />} />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} setUserData={setUserData} />}
        />
        <Route path="/CreatePost" element={isLoggedIn ? <CreatePost useremail={userData?.email} username={userData?.name} /> : <Navigate to="/register" />} />
        <Route path="/investor" element={isLoggedIn ? <Investor /> : <Navigate to="/login" />} />
        <Route path="/InvestorPage" element={isLoggedIn ? <InvestorPage /> : <Navigate to="/login" />} />
        <Route path="/product" element={isLoggedIn ? <Product useremail={userData?.email} /> : <Navigate to="/login" />} />
        <Route path="/ProductPage/:email" element={isLoggedIn ? <ProductPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:email" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        <Route
          path="/company/:email"
          element={isLoggedIn && userData?.type === "company" ? <Company /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-product/:email"
          element={isLoggedIn && userData?.type === "company" ? <Insert /> : <Navigate to="/login" />}
        />
        <Route path="/investors/tag/:tagName" element={<InvestorsByTag />} />
        <Route path="/products-by-tag/:tag" element={<ProductsByTag />} />
        <Route path="/update-product/:email" element={<Update />} />
        <Route path="/MyInvestment/:email" element={isLoggedIn ? <MyInvestment useremail={userData?.email} /> : <Navigate to="/login" />} />
       
        {/* 👇 Updated: Pass userData.email to VirtualAssets */}
        <Route
          path="/VirtualAssets"
          element={isLoggedIn ? <VirtualAssets userEmail={userData?.email} /> : <Navigate to="/login" />}
        />
       
        {/* 👇 Updated: TokenPage will receive logged-in user's email via navigation state (handled in VirtualAssets.jsx) */}
        <Route
          path="/TokenPage/:email"
          element={isLoggedIn ? <TokenPage /> : <Navigate to="/login" />}
        />
      </Routes>
      <Footer />
    </Router>
  );
}


export default App;

