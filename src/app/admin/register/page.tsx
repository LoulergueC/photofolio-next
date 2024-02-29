"use client";
import { useEffect, useState } from "react";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import ErrorDisplay from "../components/Errors/ErrorDisplay";
import Header from "../components/Header/Header";
import Link from "next/link";
import Button from "../components/Button/Button";
import "./Register.css";

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
      <ErrorDisplay error={error} setError={setError} />
      <Header
        subtitle={"Dashboard"}
        leftEl={"🙌"}
        rightEl={"🥳"}
        desc={
          <>
            Create your passkey. <br />
            Maybe you need to <Link href="/admin/login">Login</Link>
          </>
        }>
        Register
      </Header>
      <form onSubmit={handleSubmit} className="register__form">
        {isAvailable ? (
          <>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button type="submit">Register</Button>
          </>
        ) : (
          <p>Your browser does not support WebAuthn.</p>
        )}
      </form>
    </>
  );
}
