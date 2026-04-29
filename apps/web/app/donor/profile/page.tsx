"use client";

import React from "react";
import { Mail, MapPin, Droplet, User, ShieldCheck, Phone, Building2, CheckCircle, Loader2, PencilLine, AlertCircle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type Profile = {
  id: number;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  hospital_name?: string;
  blood_group: string;
  location: string;
  created_at?: string;
};

const seededProfile: Profile = {
  id: 0,
  name: "Demo Donor",
  email: "donor@example.com",
  blood_group: "O+",
  location: "Mumbai",
  role: "donor",
  phone: "",
  hospital_name: "",
};

export default function DonorProfilePage() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    location: "",
    blood_group: "",
    hospital_name: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        
        if (!parsed?.id && !parsed?.email) {
          throw new Error("No user credentials found");
        }
        
        const idQuery = parsed?.id ? `?id=${encodeURIComponent(parsed.id)}` : "";
        const emailQuery = !idQuery && parsed?.email ? `?email=${encodeURIComponent(parsed.email)}` : "";

        const res = await fetch(`${API_BASE_URL}/api/user/profile${idQuery || emailQuery}`, { cache: "no-store" });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch profile");
        }

        const data = await res.json();
        
        // Ensure all required fields exist with proper defaults
        const normalized: Profile = {
          id: data.id || 0,
          name: data.name || "",
          email: data.email || "",
          role: data.role || "donor",
          phone: data.phone || "",
          hospital_name: data.hospital_name || "",
          blood_group: data.blood_group || "",
          location: data.location || "",
          created_at: data.created_at || "",
        };
        
        setProfile(normalized);
        setFormData({
          name: normalized.name,
          phone: normalized.phone || "",
          location: normalized.location,
          blood_group: normalized.blood_group,
          hospital_name: normalized.hospital_name || "",
        });
        setErrorMessage("");
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setErrorMessage(err.message || "Failed to load profile");
        
        // Use seeded profile as fallback
        setProfile(seededProfile);
        setFormData({
          name: seededProfile.name,
          phone: seededProfile.phone || "",
          location: seededProfile.location,
          blood_group: seededProfile.blood_group,
          hospital_name: seededProfile.hospital_name || "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const current = profile || seededProfile;
  const currentRole = (current.role || "donor").toLowerCase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }
      if (!formData.location.trim()) {
        throw new Error("Location is required");
      }
      if (currentRole === "donor" && !formData.blood_group) {
        throw new Error("Blood group is required for donors");
      }
      
      const payload: Record<string, string | number> = {
        id: current.id,
        email: current.email,
        role: currentRole,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
      };

      if (currentRole === "donor") {
        payload.blood_group = formData.blood_group;
      }

      if (currentRole === "hospital") {
        payload.hospital_name = formData.hospital_name.trim();
      }

      const res = await fetch(`${API_BASE_URL}/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update profile");
      }

      const updatedUser = data.user as Profile;
      
      // Ensure all fields are properly set
      const normalizedUser: Profile = {
        id: updatedUser.id || current.id,
        name: updatedUser.name || formData.name,
        email: updatedUser.email || current.email,
        role: updatedUser.role || currentRole,
        phone: updatedUser.phone || formData.phone,
        location: updatedUser.location || formData.location,
        blood_group: updatedUser.blood_group || formData.blood_group,
        hospital_name: updatedUser.hospital_name || formData.hospital_name,
        created_at: updatedUser.created_at || current.created_at,
      };
      
      setProfile(normalizedUser);
      setFormData({
        name: normalizedUser.name,
        phone: normalizedUser.phone || "",
        location: normalizedUser.location,
        blood_group: normalizedUser.blood_group || "",
        hospital_name: normalizedUser.hospital_name || "",
      });

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          localStorage.setItem("user", JSON.stringify({ ...parsed, ...normalizedUser }));
        } catch {
          // no-op: local storage parse failure should not block profile update
        }
      }

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully");
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Profile</h1>
          <p className="text-neutral-500 font-medium mt-1">Verified account information</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsEditing((prev) => !prev);
            setSuccessMessage("");
            setErrorMessage("");
            // Reset form data when canceling
            if (isEditing && profile) {
              setFormData({
                name: profile.name,
                phone: profile.phone || "",
                location: profile.location,
                blood_group: profile.blood_group || "",
                hospital_name: profile.hospital_name || "",
              });
            }
          }}
          className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest text-neutral-300 hover:text-white hover:border-rose-500/40 transition-all"
        >
          <PencilLine className="w-4 h-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 text-sm font-bold animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-sm font-bold animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleUpdate}>
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableField 
              icon={User} 
              label="Full Name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              disabled={!isEditing} 
            />
            <ReadOnlyField 
              icon={Mail} 
              label="Email" 
              value={current.email} 
            />
            <EditableField 
              icon={Phone} 
              label="Phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              disabled={!isEditing} 
            />
            <EditableField 
              icon={MapPin} 
              label="Location" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              disabled={!isEditing} 
            />

            {currentRole === "donor" && (
              <EditableSelectField
                icon={Droplet}
                label="Blood Group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                disabled={!isEditing}
                options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
              />
            )}

            {currentRole === "hospital" && (
              <EditableField
                icon={Building2}
                label="Hospital Name"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            )}
          </div>

          {/* Role Badge */}
          <div className="mt-8 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
              Role: {(current.role || "donor").toUpperCase()}
            </p>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSuccessMessage("");
                  setErrorMessage("");
                  // Reset form data
                  if (profile) {
                    setFormData({
                      name: profile.name,
                      phone: profile.phone || "",
                      location: profile.location,
                      blood_group: profile.blood_group || "",
                      hospital_name: profile.hospital_name || "",
                    });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-black px-6 py-3 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800 disabled:cursor-not-allowed text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-rose-600/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

function EditableField({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  const displayValue = value || "";
  const showPlaceholder = !disabled && !displayValue;
  
  return (
    <label className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 block">
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3">{label}</p>
      <div className="flex items-center gap-3 min-h-[24px]">
        <Icon className="w-4 h-4 text-rose-500 flex-shrink-0" />
        {disabled ? (
          <p className="w-full text-white font-black tracking-tight">
            {displayValue || <span className="text-neutral-600 italic font-medium">Not provided</span>}
          </p>
        ) : (
          <input
            type="text"
            name={name}
            value={displayValue}
            onChange={onChange}
            placeholder={showPlaceholder ? `Enter ${label.toLowerCase()}` : ""}
            className="w-full bg-transparent text-white font-black tracking-tight outline-none placeholder:text-neutral-600 placeholder:italic placeholder:font-medium"
          />
        )}
      </div>
    </label>
  );
}

function EditableSelectField({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  disabled,
  options,
}: {
  icon: React.ElementType;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
  options: string[];
}) {
  const displayValue = value || "";
  
  return (
    <label className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 block">
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3">{label}</p>
      <div className="flex items-center gap-3 min-h-[24px]">
        <Icon className="w-4 h-4 text-rose-500 flex-shrink-0" />
        {disabled ? (
          <p className="w-full text-white font-black tracking-tight">
            {displayValue || <span className="text-neutral-600 italic font-medium">Not provided</span>}
          </p>
        ) : (
          <select
            name={name}
            value={displayValue}
            onChange={onChange}
            className="w-full bg-transparent text-white font-black tracking-tight outline-none cursor-pointer"
          >
            <option value="" className="bg-neutral-900 text-neutral-500">Select {label}</option>
            {options.map((option) => (
              <option key={option} value={option} className="bg-neutral-900 text-white">
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
    </label>
  );
}

function ReadOnlyField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  const displayValue = value || "";
  
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3">{label}</p>
      <div className="flex items-center gap-3 min-h-[24px]">
        <Icon className="w-4 h-4 text-rose-500 flex-shrink-0" />
        <p className="text-neutral-400 font-black tracking-tight">
          {displayValue || <span className="text-neutral-600 italic font-medium">Not provided</span>}
        </p>
      </div>
    </div>
  );
}
