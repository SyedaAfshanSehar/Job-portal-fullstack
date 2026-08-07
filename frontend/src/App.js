import Signup from "./Signup";
import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import JobDetails from "./JobDetails";



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

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/jobs/")
      .then((response) => response.json())
      .then((data) => setJobs(data));
  }, []);
  const addJob = async () => {

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
    `http://127.0.0.1:8000/api/jobs/update/${editingId}/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedJob),
    }
  );

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
  "http://127.0.0.1:8000/api/jobs/",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newJob),
  }
);

const data = await response.json();

console.log("Status:", response.status);
console.log(data);

if (!response.ok) {
  return;
}

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

  await fetch(
    `http://127.0.0.1:8000/api/jobs/delete/${id}/`,
    {
      method: "DELETE",
    }
  );

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
    <>
    
<div className="navbar">
  <div className="logo">
     JobPortal
  </div>

  <div className="nav-links">
    <a href="/">Home</a>
    <a href="/">Jobs</a>
    <a href="/">Contact</a>
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
      <div className="job-card">
  <h2>Add New Job</h2>

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
    Add Job
  </button>
</div>
      <input
  type="text"
  placeholder="Search jobs..."
  className="search-box"
  onChange={(e) => setSearch(e.target.value)}
/>

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
          
          <button
 className="edit-btn"
  onClick={() => editJob(job)}
>
  Edit
</button>
          
          <button
  className="delete-btn"
  onClick={() => deleteJob(job.id)}
>
  Delete
</button>
        </div>
      ))}
        </div>
        </>
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

</Routes>
);
}
export default App;