import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AiFillFire } from "react-icons/ai";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-white">
      <div className="w-mb max-w-sm bg-[#111827] rounded-2xl p-8 shadow-xl">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8">
            <AiFillFire className="w-8 h-8" style={{ color: "red" }} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold mb-6">
          Create account
        </h2>

        {/* Form */}
        <div className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#0B0F19] px-4 py-3 rounded-xl  text-sm placeholder-gray-500 focus:border-sky-500 focus:outline "
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-[#0B0F19] px-4 py-3 rounded-xl  text-sm placeholder-gray-500 focus:border-sky-500 focus:outline "
            />
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 text-xs text-gray-400 my-4">
          <input type="checkbox" className="mt-1" />
          <p>
            By signing up, I agree to the{" "}
            <span className="text-blue-400 cursor-pointer">User Agreement</span>{" "}
            and{" "}
            <span className="text-blue-400 cursor-pointer">Privacy Policy</span>
          </p>
        </div>

        {/* Button */}
        <button className="w-full bg-gray-300 text-black py-3 rounded-xl font-medium my-4">
          Sign up
        </button>

        {/* Referral */}
       
      </div>
    </div>
  );
}
