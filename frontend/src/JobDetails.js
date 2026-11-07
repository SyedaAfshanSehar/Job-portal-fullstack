import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "./api";

function JobDetails() {
   
const { id } = useParams();
const navigate = useNavigate();
const isAuthenticated = Boolean(localStorage.getItem("access"));

const [job, setJob] = useState(null);

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [resume, setResume] = useState(null);
const [coverLetter, setCoverLetter] = useState("");

useEffect(() => {
  const accessToken = localStorage.getItem("access");
  if (!accessToken) {
    return;
  }

  fetch(`${API_BASE_URL}/api/profile/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data) {
        setName(data.username);
        setEmail(data.email);
      }
    });
}, []);

useEffect(() => {
  fetch(`${API_BASE_URL}/api/jobs/${id}/`)
    .then((response) => response.json())
    .then((data) => setJob(data));
}, [id]);

const applyJob = async () => {

  const formData = new FormData();

  formData.append("job", job.id);
  formData.append("name", name);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("resume", resume);
  formData.append("cover_letter", coverLetter);

  const response = await fetch(
  `${API_BASE_URL}/api/apply/`,
  {

    
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
    body: formData,
  }
);

  if (response.ok) {
alert("Application Submitted Successfully!");
navigate("/");
} else {
    alert("Something went wrong!");
  }
};

if (!job) {
  return <h2>Loading...</h2>;
}
  return (
    <div className="details-container">
      <h1>Job Details Page</h1>
{job.logo && (
  <img
    src={job.logo}
    alt="Company Logo"
    style={{
      width: "90px",
      height: "90px",
      objectFit: "contain",
      marginBottom: "20px",
    }}
  />
)}
      <h2>{job.title}</h2>

<p>
  <strong>Company:</strong> {job.company}
</p>

<p>
  <strong>Location:</strong> {job.location}
</p>

<p>
  <strong>Salary:</strong> {job.salary}
</p>

<p>
  <strong>Job Type:</strong> {job.job_type}
</p>

<p>
  <strong>Posted:</strong> {job.posted_date}
</p>

<p>
  {job.description}
</p>

<h3>Apply for this Job</h3>

{isAuthenticated ? (
  <>
<input
  type="text"
  placeholder="Your Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

<br /><br />

<input
  type="email"
  placeholder="Your Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<br /><br />

<input
  type="text"
  placeholder="Phone Number"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>

<br /><br />

<input
  type="file"
  onChange={(e) => setResume(e.target.files[0])}
/>

<br /><br />

<textarea
  placeholder="Cover Letter"
  value={coverLetter}
  onChange={(e) => setCoverLetter(e.target.value)}
/>

<br /><br />

<button onClick={applyJob}>
  Submit Application
</button>
  </>
) : (
  <p>
    <Link to="/login">Log in</Link> to apply for this job.
  </p>
)}
    </div>
  );
}

export default JobDetails;