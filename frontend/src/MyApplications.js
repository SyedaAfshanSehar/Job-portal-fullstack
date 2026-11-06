import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./api";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const expireSession = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchApplications = async () => {
      const accessToken = localStorage.getItem("access");
      if (!accessToken) {
        setError("Your session has ended. Please log in again.");
        setLoading(false);
        expireSession();
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/applications/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });

        if (response.status === 401) {
          expireSession();
          return;
        }
        if (!response.ok) {
          throw new Error("Unable to load your applications. Please try again.");
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The applications response was invalid.");
        }
        setApplications(data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load your applications. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchApplications();
    return () => controller.abort();
  }, [expireSession]);

  const downloadResume = async (application) => {
    const accessToken = localStorage.getItem("access");
    if (!accessToken) {
      setError("Your session has ended. Please log in again.");
      expireSession();
      return;
    }
    if (!application.resume) {
      setError("No resume was uploaded for this application.");
      return;
    }

    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/${application.id}/resume/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 401) {
        expireSession();
        return;
      }
      if (!response.ok) {
        throw new Error("Unable to download this resume. Please try again.");
      }

      const blobUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = blobUrl;
      const filename = application.resume.split("/").pop();
      link.download = filename
        ? decodeURIComponent(filename)
        : `application-${application.id}-resume`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to download this resume. Please try again."
      );
    }
  };

  return (
    <div className="container">
      <h1>My Applications</h1>
      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Loading your applications...</p>}
      {!loading && !error && applications.length === 0 && (
        <p>You have not submitted any applications yet.</p>
      )}

      {applications.map((app) => (
        <div className="job-card" key={app.id}>
          <p><strong>Name:</strong> {app.name}</p>
          <p><strong>Email:</strong> {app.email}</p>
          <p><strong>Phone:</strong> {app.phone}</p>
          <p>
            <strong>Resume:</strong>{" "}
            {app.resume ? (
              <button
                type="button"
                className="apply-btn"
                onClick={() => downloadResume(app)}
              >
                Download Resume
              </button>
            ) : (
              <span>No resume uploaded</span>
            )}
          </p>
          <p><strong>Cover Letter:</strong> {app.cover_letter}</p>
        </div>
      ))}
    </div>
  );
}

export default MyApplications;