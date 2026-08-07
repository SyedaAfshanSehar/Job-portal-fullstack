import { useState } from "react";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupUser = async () => {
    const user = {
      username,
      email,
      password,
    };

    const response = await fetch(
      "http://127.0.0.1:8000/api/register/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Account Created Successfully!");
      console.log(data);

      setUsername("");
      setEmail("");
      setPassword("");
    } else {
      alert("Registration Failed!");
      console.log(data);
    }
  };

  return (
    <div className="details-container">
      <h1>Create Account</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />
      <br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={signupUser}>
        Sign Up
      </button>
    </div>
  );
}

export default Signup;