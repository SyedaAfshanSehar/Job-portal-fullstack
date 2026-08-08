import { useEffect, useState } from "react";

function MyApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/applications/")
      .then((res) => res.json())
      .then((data) => setApplications(data));
  }, []);

  return (
    <div className="container">
      <h1>My Applications</h1>

      {applications.map((app) => (
        <div className="job-card" key={app.id}>
          <p><strong>Name:</strong> {app.name}</p>
          <p><strong>Email:</strong> {app.email}</p>
          <p><strong>Phone:</strong> {app.phone}</p>
          <p><strong>Resume:</strong> {app.resume}</p>
          <p><strong>Cover Letter:</strong> {app.cover_letter}</p>
        </div>
      ))}
    </div>
  );
}

export default MyApplications;