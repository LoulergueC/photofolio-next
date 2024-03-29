"use client";
import { startAuthentication } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ErrorDisplay from "../components/Errors/ErrorDisplay";
import Header from "../components/Header/Header";
import Link from "next/link";
import Button from "../components/Button/Button";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");

  const goLogin = async () => {
    const resp = await fetch("/api/authenticate");

    if (!resp.ok) {
      router.push("/admin/register");
      return;
    }

    let asseResp;
    try {
      // Pass the options to the authenticator and wait for a response
      asseResp = await startAuthentication(await resp.json());
    } catch (error: any) {
      setError(error.message);
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
      router.push("/admin");
    } else {
      setError(verificationJSON.error);
    }
  };

  return (
    <>
      <ErrorDisplay error={error} setError={setError} />
      <Header
        subtitle={"Dashboard"}
        rightEl={"👋"}
        desc={
          <>
            Connect with your passkey. <br />
            Maybe you need to <Link href="/admin/register">Register</Link>
          </>
        }>
        Login
      </Header>
      <div>
        <Button onClick={goLogin} style={{ margin: "auto" }}>
          Login
        </Button>
      </div>
    </>
  );
}
