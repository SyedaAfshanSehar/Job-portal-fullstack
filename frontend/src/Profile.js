import { useEffect, useState } from "react";
import { API_BASE_URL } from "./api";

function Profile() {
  const [user, setUser] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/profile/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  return (
    <div className="details-container">
      <h1>My Profile</h1>

      <h3>Username: {user.username}</h3>

      <h3>Email: {user.email}</h3>
    </div>
  );
}

export default Profile;