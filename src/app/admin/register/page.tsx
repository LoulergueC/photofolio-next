"use client";
import { useEffect, useState } from "react";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import ErrorDisplay from "../components/Errors/ErrorDisplay";

export default function Register() {
  const [email, setEmail] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkWebAuthnAvailability = async () => {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available && browserSupportsWebAuthn());
    };
    checkWebAuthnAvailability();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    fetch("/api/register?email=" + email)
      .then((response) => {
        if (!response.ok) {
          // Parse the JSON error message from the response
          return response.json().then((errorData) => {
            // Handle the error
            setError(errorData.error || "Unknown error occurred");
            throw new Error(errorData.error || "Unknown error occurred");
          });
        }
        // Handle the successful response here
        return response.json();
      })
      .then(async (data) => {
        let attResp;
        try {
          // Pass the options to the authenticator and wait for a response
          attResp = await startRegistration(data);

          fetch("/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(attResp),
          })
            .then((response) => {
              if (!response.ok) {
                // Parse the JSON error message from the response
                return response.json().then((errorData) => {
                  // Handle the error
                  setError(errorData.error || "Unknown error occurred");
                  throw new Error(errorData.error || "Unknown error occurred");
                });
              }
              // Handle the successful response here
              return response.json();
            })
            .then((data) => {
              if (data.verified) {
                router.push("/admin");
              } else {
                setError("Unknown error occurred");
                console.log(JSON.stringify(data));
              }
            });
        } catch (error: any) {
          // Some basic error handling
          setError(error.message);
          if (error.name === "InvalidStateError") {
            setError("Error: Authenticator was probably already registered by user");
            throw new Error("Error: Authenticator was probably already registered by user");
          }
          throw error;
        }
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error:", error.message);
      });
  };

  return (
    <>
      <h1>Register Account</h1>
      <ErrorDisplay error={error} setError={setError} />
      {isAvailable ? (
        <form onSubmit={handleSubmit}>
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
