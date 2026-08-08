import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/profile/", {
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