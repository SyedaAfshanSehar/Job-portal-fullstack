import Signup from "./Signup";
import Login from "./Login";
import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import JobDetails from "./JobDetails";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "./Profile";
import MyApplications from "./MyApplications";
import { API_BASE_URL } from "./api";




function App() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
const [company, setCompany] = useState("");
const [location, setLocation] = useState("");
const [salary, setSalary] = useState("");
const [description, setDescription] = useState("");
const [jobType, setJobType] = useState("Remote");
const [logo, setLogo] = useState("");
const [editingId, setEditingId] = useState(null);
const [isStaff, setIsStaff] = useState(false);
const [apiError, setApiError] = useState("");

const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");

  alert("Logged Out Successfully!");

  window.location.href = "/login";
};
  useEffect(() => {
  fetch(`${API_BASE_URL}/api/jobs/`)
      .then((response) => response.json())
      .then((data) => setJobs(data));

  const accessToken = localStorage.getItem("access");
  if (accessToken) {
    fetch(`${API_BASE_URL}/api/profile/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        if (!response.ok) {
          return null;
        }
        return response.json();
      })
      .then((data) => setIsStaff(data?.is_staff === true))
      .catch(() => setIsStaff(false));
  }
}, []);
  const addJob = async () => {
    setApiError("");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access") || ""}`,
    };

    if (editingId) {

  const updatedJob = {
  title,
  company,
  location,
  salary,
  description,
  job_type: jobType,
  logo,
};

  const response = await fetch(
    `${API_BASE_URL}/api/jobs/update/${editingId}/`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(updatedJob),
    }
  );

  if (!response.ok) {
    setApiError("Unable to update this job. Your account may not have permission.");
    return;
  }
  const data = await response.json();

  setJobs(
    jobs.map((job) =>
      job.id === editingId ? data : job
    )
  );

  setEditingId(null);

  setTitle("");
  setCompany("");
  setLocation("");
  setSalary("");
  setDescription("");

  return;
}
  const newJob = {
  title,
  company,
  location,
  salary,
  description,
  job_type: jobType,
  logo,
};

  const response = await fetch(
  `${API_BASE_URL}/api/jobs/`,
  {
  method: "POST",
  headers,
  body: JSON.stringify(newJob),
  }
);

if (!response.ok) {
  setApiError("Unable to create this job. Your account may not have permission.");
  return;
}

const data = await response.json();
setJobs([...jobs, data]);

setTitle("");
setCompany("");
setLocation("");
setSalary("");
setDescription("");
setJobType("Remote");
setLogo("");

  setTitle("");
  setCompany("");
  setLocation("");
  setSalary("");
  setDescription("");
  setJobType("Remote");
  setLogo("");
};
const deleteJob = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this job?"
  );

  if (!confirmDelete) {
    return;
  }

  setApiError("");
  const response = await fetch(
    `${API_BASE_URL}/api/jobs/delete/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access") || ""}`,
      },
    }
  );

  if (!response.ok) {
    setApiError("Unable to delete this job. Your account may not have permission.");
    return;
  }
  setJobs(jobs.filter((job) => job.id !== id));
};

const editJob = (job) => {

  setEditingId(job.id);

  setTitle(job.title);
  setCompany(job.company);
  setLocation(job.location);
  setSalary(job.salary);
  setDescription(job.description);
  setJobType(job.job_type);
  setLogo(job.logo);
};
return (
  <Routes>

    <Route
  path="/"
  element={
      <ProtectedRoute>
        <>
    
<div className="navbar">
  <div className="logo">
     JobPortal
  </div>

  <div className="nav-links">
    <a href="/">Home</a>
    <a href="/">Jobs</a>
    <a href="/">Contact</a>

    <button onClick={logout} className="apply-btn">
    Logout
  </button>
  </div>
</div>
    <div className="container">
      <div className="hero">
  <h1>Find Your Dream Job Today</h1>

  <p>
    Discover the latest remote and onsite opportunities from top companies.
    Start your career with confidence.
  </p>

  <button className="hero-btn">
    Explore Jobs
  </button>
</div>
<div className="stats">

  <div className="stat-card">
    <h2>500+</h2>
    <p>Jobs Available</p>
  </div>

  <div className="stat-card">
    <h2>100+</h2>
    <p>Companies</p>
  </div>

  <div className="stat-card">
    <h2>1000+</h2>
    <p>Applications</p>
  </div>

</div>
      <h1 className="heading">Latest Jobs</h1>
      {isStaff && <div className="job-card">
  <h2>{editingId ? "Edit Job" : "Add New Job"}</h2>

  <input
    type="text"
    placeholder="Job Title"
    className="search-box"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />

  <input
  type="text"
  placeholder="Company Logo URL"
  className="search-box"
  value={logo}
  onChange={(e) => setLogo(e.target.value)}
/>

<input
    type="text"
    placeholder="Company"
    className="search-box"
    value={company}
    onChange={(e) => setCompany(e.target.value)}
  />

  <input
    type="text"
    placeholder="Location"
    className="search-box"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
  />

  <input
    type="text"
    placeholder="Salary"
    className="search-box"
    value={salary}
    onChange={(e) => setSalary(e.target.value)}
  />

  <textarea
    placeholder="Description"
    className="search-box"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />

  <select
  className="search-box"
  value={jobType}
  onChange={(e) => setJobType(e.target.value)}
>
  <option value="Remote">Remote</option>
  <option value="Hybrid">Hybrid</option>
  <option value="Onsite">Onsite</option>
</select>

 <button className="apply-btn" onClick={addJob}>
  {editingId ? "Update Job" : "Add Job"}
</button>
</div>}
      {apiError && <p role="alert">{apiError}</p>}
      <input
  type="text"
  placeholder="Search jobs..."
  className="search-box"
  onChange={(e) => setSearch(e.target.value)}
/>

<div className="jobs-grid">
      {jobs
  .filter((job) =>
          job.title &&

    job.title.toLowerCase().includes(search.toLowerCase())
  )
  .map((job) => (
        <div className="job-card" key={job.id}>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    {job.logo && (
      <img
        src={job.logo}
        alt="Company Logo"
        style={{
          width: "60px",
          height: "60px",
          objectFit: "contain",
          borderRadius: "8px",
        }}
      />
    )}

    <h2>{job.title}</h2>
  </div>

  
  <p>🏢 <strong>Company:</strong> {job.company}</p>

<p>📍 <strong>Location:</strong> {job.location}</p>

<p>💰 <strong>Salary:</strong> PKR {job.salary}</p>

<p>🏠 <strong>Job Type:</strong> {job.job_type}</p>

<p>📅 <strong>Posted:</strong> {job.posted_date}</p>

          <p>{job.description}</p>

          <Link to={`/job/${job.id}`}>
  <button className="apply-btn">
    Apply Now
  </button>
</Link>
          
          {isStaff && <button
 className="edit-btn"
  onClick={() => editJob(job)}
>
  Edit
          </button>}
          
          {isStaff && <button
  className="delete-btn"
  onClick={() => deleteJob(job.id)}
>
  Delete
          </button>}
        </div>
      ))}
    </div>
    </div>
    </>
            </ProtectedRoute>

      }
    />

    <Route
  path="/job/:id"
  element={<JobDetails />}
/>

<Route
  path="/signup"
  element={<Signup />}
/>

<Route
  path="/login"
  element={<Login />}
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

<Route
  path="/applications"
  element={
    <ProtectedRoute>
      <MyApplications />
    </ProtectedRoute>
  }
/>

</Routes>
);
}
export default App;