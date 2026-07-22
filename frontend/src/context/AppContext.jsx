import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://doctor-backend-cbt3.onrender.com";
  const currencySymbol = "₹";

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);

  // Clears an invalid/expired session without bothering the user with a raw error
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUserData(null);
  };

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) setDoctors(data.doctors);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else if (data.tokenExpired) {
        // Stale/expired token from a previous session — just log out quietly,
        // don't greet the user with a "jwt expired" error on page load
        logout();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // Network/server error while checking the session — don't clear the token,
      // it might just be a temporary connectivity issue (e.g. Render cold start)
      console.error("Failed to load profile:", error);
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(null);
    }
  }, [token]);

  const value = {
    doctors, getDoctorsData,
    token, setToken, logout,
    userData, setUserData, loadUserProfileData,
    backendUrl, currencySymbol,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
export const useAppContext = () => useContext(AppContext);
