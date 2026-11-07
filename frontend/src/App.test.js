import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Link, MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("react-router-dom", () => jest.requireActual("react-router"));

const jobs = [
  {
    id: 1,
    title: "Frontend Engineer",
    company: "Example",
    location: "Remote",
    salary: "100",
    description: "Build interfaces",
    job_type: "Remote",
    posted_date: "2026-01-01",
    logo: "",
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "Example",
    location: "Hybrid",
    salary: "200",
    description: "Build APIs",
    job_type: "Hybrid",
    posted_date: "2026-01-02",
    logo: "",
  },
];

function response(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
  };
}

function renderApp(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
      <Link to="/">Home</Link>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  window.fetch = jest.fn((url) => {
    if (url.endsWith("/api/jobs/")) {
      return Promise.resolve(response(jobs));
    }
    if (url.endsWith("/api/jobs/1/")) {
      return Promise.resolve(response(jobs[0]));
    }
    return Promise.resolve(response({ is_staff: false }));
  });
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("visitors can browse, search, and view jobs but must log in to apply", async () => {
  renderApp();

  expect(await screen.findByText("Frontend Engineer")).toBeInTheDocument();
  expect(screen.getByText("Backend Engineer")).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText("Search jobs..."), {
    target: { value: "frontend" },
  });

  expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
  expect(screen.queryByText("Backend Engineer")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("link", { name: "Apply Now" }));
  expect(await screen.findByText("Frontend Engineer")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
  expect(screen.getByText("to apply for this job.")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Submit Application" })
  ).not.toBeInTheDocument();
});

test("staff controls appear after login and disappear after logout without refresh", async () => {
  window.fetch.mockImplementation((url) => {
    if (url.endsWith("/api/jobs/")) {
      return Promise.resolve(response(jobs));
    }
    if (url.endsWith("/api/token/")) {
      return Promise.resolve(
        response({ access: "staff-access", refresh: "staff-refresh" })
      );
    }
    if (url.endsWith("/api/profile/")) {
      return Promise.resolve(response({ is_staff: true }));
    }
    return Promise.resolve(response({}));
  });

  renderApp();

  expect(await screen.findByText("Frontend Engineer")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Add Job" })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("link", { name: "Login" }));
  fireEvent.change(screen.getByPlaceholderText("Username"), {
    target: { value: "staff" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));

  expect(
    await screen.findByRole("button", { name: "Add Job" })
  ).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2);
  expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);

  fireEvent.click(screen.getByRole("button", { name: "Logout" }));
  fireEvent.click(screen.getByRole("link", { name: "Home" }));

  await waitFor(() => {
    expect(
      screen.queryByRole("button", { name: "Add Job" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });
  expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
});

test("cancelling and saving an edit reset every job form field", async () => {
  localStorage.setItem("access", "staff-access");
  window.fetch.mockImplementation((url, options = {}) => {
    if (url.endsWith("/api/jobs/")) {
      return Promise.resolve(response(jobs));
    }
    if (url.endsWith("/api/profile/")) {
      return Promise.resolve(response({ is_staff: true }));
    }
    if (url.includes("/api/jobs/update/") && options.method === "PUT") {
      return Promise.resolve(
        response({ ...jobs[0], ...JSON.parse(options.body) })
      );
    }
    return Promise.resolve(response({}));
  });

  renderApp();
  expect(await screen.findByRole("button", { name: "Add Job" })).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
  expect(screen.getByPlaceholderText("Job Title")).toHaveValue("Frontend Engineer");
  expect(screen.getByPlaceholderText("Company Logo URL")).toHaveValue("");
  expect(screen.getByRole("combobox")).toHaveValue("Remote");

  fireEvent.click(screen.getByRole("button", { name: "Cancel Edit" }));
  expect(screen.getByRole("button", { name: "Add Job" })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Job Title")).toHaveValue("");
  expect(screen.getByPlaceholderText("Company Logo URL")).toHaveValue("");
  expect(screen.getByPlaceholderText("Company")).toHaveValue("");
  expect(screen.getByPlaceholderText("Location")).toHaveValue("");
  expect(screen.getByPlaceholderText("Salary")).toHaveValue("");
  expect(screen.getByPlaceholderText("Description")).toHaveValue("");
  expect(screen.getByRole("combobox")).toHaveValue("Remote");

  fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
  fireEvent.change(screen.getByPlaceholderText("Job Title"), {
    target: { value: "Updated Engineer" },
  });
  fireEvent.change(screen.getByPlaceholderText("Company Logo URL"), {
    target: { value: "https://example.com/logo.png" },
  });
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "Hybrid" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Update Job" }));

  expect(await screen.findByText("Updated Engineer")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add Job" })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Job Title")).toHaveValue("");
  expect(screen.getByPlaceholderText("Company Logo URL")).toHaveValue("");
  expect(screen.getByRole("combobox")).toHaveValue("Remote");
});
