import React, { useState, useEffect } from "react";
import "./Login.css";

export default function Register({ onToggle, onSuccess }) {
  const initialForm = React.useMemo(
    () => ({
      fullNames: "",
      familyName: "",
      email: "",
      password: "",
      gfgNumber: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    setFormData(initialForm);
  }, [initialForm]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.gfgNumber.length !== 14 || !/^\d+$/.test(formData.gfgNumber)) {
      alert("GFG number must be exactly 14 digits.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        // Store token in localStorage
        localStorage.setItem("token", data.token);
        setFormData(initialForm);
        if (onSuccess) onSuccess(data.user); // Pass user data to parent
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      alert("Network error.");
    }
  };

  return (
    <div id="Container">
      <form className="form" onSubmit={handleSubmit}>
        <div id="login-lable">Register</div>

        <input
          className="form-content"
          type="text"
          name="fullNames"
          placeholder="Full Names"
          autoComplete="new-full-names"
          autoCorrect="off"
          autoCapitalize="off"
          value={formData.fullNames}
          onChange={handleChange}
          required
        />
        <input
          className="form-content"
          type="text"
          name="familyName"
          placeholder="Family Name"
          autoComplete="new-family-name"
          autoCorrect="off"
          autoCapitalize="off"
          value={formData.familyName}
          onChange={handleChange}
          required
        />
        <input
          className="form-content"
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="new-email"
          autoCorrect="off"
          autoCapitalize="off"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="form-content"
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          className="form-content"
          type="text"
          name="gfgNumber"
          placeholder="GFG 14-Digit Number"
          autoComplete="new-gfg-number"
          autoCorrect="off"
          autoCapitalize="off"
          maxLength="14"
          value={formData.gfgNumber}
          onChange={handleChange}
          required
        />
        <button type="submit">Continue</button>
        <button type="button" style={{ marginTop: "1em" }} onClick={onToggle}>
          I have an account
        </button>
      </form>

      <div id="rays">
        <svg
          fill="none"
          viewBox="0 0 299 152"
          height="9em"
          width="18em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="url(#paint0_linear_8_3)"
            d="M149.5 152H133.42L0 0H149.5L299 0L165.58 152H149.5Z"
          ></path>
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              y2="12.1981"
              x2="150.12"
              y1="152"
              x1="149.5"
              id="paint0_linear_8_3"
            >
              <stop stopColor="#00E0FF"></stop>
              <stop stopOpacity="0" stopColor="#65EDFF" offset="1"></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div id="emiter">{/* Emitter SVG here if needed */}</div>
    </div>
  );
}
