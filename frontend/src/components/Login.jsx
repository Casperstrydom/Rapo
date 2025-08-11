import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Navigation hook
import "./Login.css";
const BASEURL = process.env.REACT_APP_BASEURL || "http://localhost:5000"; // Use environment variable or default
export default function Login({ onToggle, onSuccess }) {
  const navigate = useNavigate(); // ✅ Hook initialized

  const initialLogin = React.useMemo(
    () => ({
      email: "",
      password: "",
    }),
    []
  );

  const [loginData, setLoginData] = useState(initialLogin);

  useEffect(() => {
    setLoginData(initialLogin);
  }, [initialLogin]);

  const handleChange = (e) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASEURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setLoginData(initialLogin);
        if (onSuccess) onSuccess(data.user);
        navigate("/home"); // ✅ Redirect after successful login
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  return (
    <div id="Container">
      <form className="form" onSubmit={handleSubmit}>
        <div id="login-lable">Login</div>

        <input
          className="form-content"
          type="text"
          name="email"
          placeholder="Email"
          value={loginData.email}
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
          value={loginData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Continue</button>

        <button type="button" style={{ marginTop: "1em" }} onClick={onToggle}>
          Register
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

      <div id="emiter">{/* Optional additional SVG or animation */}</div>
    </div>
  );
}
