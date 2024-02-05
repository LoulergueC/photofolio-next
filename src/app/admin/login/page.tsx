"use client";
import { startAuthentication } from "@simplewebauthn/browser";

export default function Login() {
  const goLogin = async () => {
    const resp = await fetch("/api/authenticate");

    let asseResp;
    try {
      // Pass the options to the authenticator and wait for a response
      asseResp = await startAuthentication(await resp.json());
    } catch (error) {
      throw error;
    }

    const verificationResp = await fetch("/api/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(asseResp),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();

    // Show UI appropriate for the `verified` status
    if (verificationJSON && verificationJSON.verified) {
      alert("Success!");
    } else {
      console.log(JSON.stringify(verificationJSON));
    }
  };

  return (
    <>
      <h1>Login</h1>
      <button onClick={goLogin}>Login</button>
    </>
  );
}
