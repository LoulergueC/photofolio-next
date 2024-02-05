"use client";
import { useEffect, useState } from "react";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";

export default function Register() {
  const [email, setEmail] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebAuthnAvailability = async () => {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available && browserSupportsWebAuthn());
    };
    checkWebAuthnAvailability();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const generateRegistrationOptions = await fetch("/api/register?email=" + email);

    let attResp;
    try {
      // Pass the options to the authenticator and wait for a response
      attResp = await startRegistration(await generateRegistrationOptions.json());
    } catch (error) {
      throw error;
    }

    console.log(attResp);

    const verificationResp = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attResp),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();

    // Show UI appropriate for the `verified` status
    if (verificationJSON && verificationJSON.verified) {
      alert("Success!");
    } else {
      console.log(JSON.stringify(verificationJSON));
    }

    // fetch("/api/register?email=" + email)
    //   .then((response) => {
    //     if (!response.ok) {
    //       // Parse the JSON error message from the response
    //       return response.json().then((errorData) => {
    //         throw new Error(errorData.error || "Unknown error occurred");
    //       });
    //     }
    //     // Handle the successful response here
    //     return response.json();
    //   })
    //   .then((data) => {
    //     console.log("Success:", data);
    //     let attResp;
    //     try {
    //       // Pass the options to the authenticator and wait for a response
    //       attResp = startRegistration(data);

    //       fetch("/api/register", {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(attResp),
    //       });
    //     } catch (error: any) {
    //       // Some basic error handling
    //       if (error.name === "InvalidStateError") {
    //         throw new Error("Error: Authenticator was probably already registered by user");
    //       }
    //       throw error;
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error:", error.message);
    //   });
  };

  return (
    <>
      <h1>Register Account</h1>
      {isAvailable ? (
        <form method="POST" onSubmit={handleSubmit}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input type="submit" value="Register" />
        </form>
      ) : (
        <p>Your browser does not support WebAuthn.</p>
      )}
    </>
  );
}
