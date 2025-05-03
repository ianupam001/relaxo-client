import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const Auth = () => {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.trim()) {
      navigate(`/bill?contact=${encodeURIComponent(phone)}`);
    }
  };
  return (
    <section id="main-home" className="">
      <div className="main-mobilecheck">
        <img src="/logo.svg" className="home-logo" alt="" />
        <p className="space">
          Hello!
          <br />
          View your digital bill
        </p>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <label htmlFor="contact" className="bill-text">
              Phone Number / Email
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              placeholder="Enter your phone number or email"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Auth;
