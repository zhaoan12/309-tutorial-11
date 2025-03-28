import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check for a token on hard reload (component mount) and fetch user data if it exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${BACKEND_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Invalid token");
          }
          return res.json();
        })
        .then((data) => {
          setUser(data.user); // user object from the backend
        })
        .catch(() => {
          // Token invalid or error occurred; remove it
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  /**
   * Logs out the current user.
   *
   * 1. Clear the token from local storage.
   * 2. Set user to null.
   * 3. Navigate to "/".
   */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  /**
   * Logs in a user with their username and password.
   *
   * On success:
   *   1. Save the received JWT token to localStorage.
   *   2. Fetch the user object from /user/me and set user in context.
   *   3. Navigate to "/profile".
   * On failure:
   *   Return the error message from the response.
   */
  const login = async (username, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        // If the response is a 4xx or 5xx, parse the error message
        const errData = await res.json();
        return errData.message || "Login failed";
      }

      // If successful, store the token
      const data = await res.json();
      localStorage.setItem("token", data.token);

      // Fetch user info
      const meRes = await fetch(`${BACKEND_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      if (!meRes.ok) {
        throw new Error("Could not fetch user data.");
      }
      const meData = await meRes.json();
      setUser(meData.user);

      // Navigate to profile
      navigate("/profile");
      return ""; // no error
    } catch (error) {
      return error.message;
    }
  };

  /**
   * Registers a new user.
   *
   * On success:
   *   Navigate to "/success".
   * On failure:
   *   Return the error message from the response.
   */
  const register = async ({ username, firstname, lastname, password }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, firstname, lastname, password }),
      });

      if (!res.ok) {
        // If the response is a 4xx or 5xx, parse the error message
        const errData = await res.json();
        return errData.message || "Registration failed";
      }

      // Registration successful
      navigate("/success");
      return ""; // no error
    } catch (error) {
      return error.message;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
