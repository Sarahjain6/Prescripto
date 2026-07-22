import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

// Decodes a JWT payload (no signature check needed client-side) to see if
// it's already past its "exp" claim, so an old/expired token can be purged
// immediately instead of being sent to the server first.
const isTokenExpired = (t) => {
  if (!t) return true;
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getValidStoredToken = (key) => {
  const stored = localStorage.getItem(key);
  if (stored && isTokenExpired(stored)) {
    localStorage.removeItem(key);
    return "";
  }
  return stored || "";
};

const AppContextProvider = ({ children }) => {
  const backendUrl = "https://doctor-backend-cbt3.onrender.com";
  const currencySymbol = "₹";

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(() => getValidStoredToken("token"));
  const [userData, setUserData] = useState(null);

  // Clears a stale/expired session quietly, without surfacing a raw
  // "jwt expired" error to the user just for opening the site
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
      toast.error(error.message);
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
        logout();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
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
