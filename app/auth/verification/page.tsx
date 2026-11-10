
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API } from "@/lib/api/axios";
import axios from "axios";

const OTP_LENGTH = 5;
const RESEND_SECONDS = 60;

const Verification = () => {
  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [timer, setTimer] = useState<number>(RESEND_SECONDS);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, "");

    const newOtp = [...otp];

    if (!value) {
      newOtp[index] = "";
      setOtp(newOtp);
      setError("");
      return;
    }

    value.split("").forEach((digit, i) => {
      if (index + i < OTP_LENGTH) {
        newOtp[index + i] = digit;
      }
    });

    setOtp(newOtp);
    setError("");

    inputRefs.current[
      Math.min(index + value.length, OTP_LENGTH - 1)
    ]?.focus();
  };

  // Handle OTP paste
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH - index);

    if (!pastedValue) return;

    const newOtp = [...otp];

    pastedValue.split("").forEach((digit, i) => {
      newOtp[index + i] = digit;
    });

    setOtp(newOtp);
    setError("");

    inputRefs.current[
      Math.min(index + pastedValue.length, OTP_LENGTH - 1)
    ]?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Resend OTP
  const handleResendOTP = async (): Promise<void> => {
    if (resendLoading || timer > 0 || loading) return;

    setError("");
    setSuccess("");

    const email = sessionStorage.getItem("passwordResetEmail");

    if (!email) {
      setError("Session expired. Please request OTP again.");
      return;
    }

    try {
      setResendLoading(true);

      await API.post("/admin/auth/forgot", { email });

      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(RESEND_SECONDS);
      setSuccess("A new OTP has been sent to your email.");

      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string; error?: string }>(err)) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to resend OTP. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Verify OTP
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (loading || resendLoading) return;

    setError("");
    setSuccess("");

    const otpCode = otp.join("");
    const email = sessionStorage.getItem("passwordResetEmail");

    if (!email) {
      setError("Session expired. Please request a new OTP.");
      return;
    }

    if (!/^\d{5}$/.test(otpCode)) {
      setError("Please enter a valid 5-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/admin/auth/verify-otp", {
        email,
        otp: otpCode,
      });

      const resetToken: unknown =
        response.data?.data?.resetToken ||
        response.data?.resetToken;

      if (typeof resetToken !== "string" || !resetToken) {
        throw new Error("Reset token not received from server.");
      }

      sessionStorage.setItem("passwordResetToken", resetToken);

      router.push("/auth/reset-password");
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string; error?: string }>(err)) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid or expired OTP."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>

        <p className="text-gray-600">
          We've sent a 5-digit code to your email address. Enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {error && (
          <div
            role="alert"
            className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm"
          >
            {success}
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-center items-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={5}
              value={digit}
              disabled={loading || resendLoading}
              onChange={(e) => handleInputChange(e, index)}
              onPaste={(e) => handlePaste(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Verify Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-[300px] "
            disabled={!isComplete || loading || resendLoading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </div>

        {/* Resend OTP */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={timer > 0 || resendLoading || loading}
            className="text-sm font-medium text-primary hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resendLoading
              ? "Resending..."
              : timer > 0
                ? `Resend OTP in ${timer}s`
                : "Resend OTP"}
          </button>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>

      </form>
    </div>
  );
};

export default Verification;
