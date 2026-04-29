"use client";

import React from "react";
import { Droplet, Loader2, PlusCircle, CheckCircle, AlertCircle, Syringe, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function HospitalPostRequestPage() {
	const [success, setSuccess] = React.useState("");
	const [error, setError] = React.useState("");
	const [formData, setFormData] = React.useState({
		blood_group: "O+",
		units: 1,
		urgency: "normal",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "units" ? Number(value) || 0 : value,
		}));
	};

	const queryClient = useQueryClient();

	const postRequestMutation = useMutation({
		mutationFn: async () => {
			const storedUser = localStorage.getItem("user");
			const parsed = storedUser ? JSON.parse(storedUser) : null;

			const res = await fetch(`${API_BASE_URL}/api/hospital/requests`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					blood_group: formData.blood_group,
					units: formData.units,
					urgency: formData.urgency,
					userId: parsed?.id,
					email: parsed?.email,
				}),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data?.message || "Failed to post request");
			return data as unknown;
		},
		onMutate: () => {
			setError("");
			setSuccess("");
		},
		onSuccess: async () => {
			setSuccess("Request Created Successfully!");
			setFormData({ blood_group: "O+", units: 1, urgency: "normal" });
			setTimeout(() => setSuccess(""), 5000);

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["requests", "all"] }),
				queryClient.invalidateQueries({ queryKey: ["hospital", "requests"] }),
				queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] }),
				queryClient.invalidateQueries({ queryKey: ["requests", "recentActivity"] }),
			]);
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : "Failed to post request");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		postRequestMutation.mutate();
	};

	return (
		<div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
				<div className="p-8 md:p-12">
					<div className="flex items-center gap-4 mb-10">
						<div className="w-14 h-14 bg-rose-600/10 border border-rose-500/20 rounded-2xl flex items-center justify-center">
							<PlusCircle className="w-7 h-7 text-rose-500" />
						</div>
						<div>
							<h1 className="text-2xl font-black text-white">Post Blood Request</h1>
							<p className="text-neutral-500 text-sm font-medium">Create a hospital blood request</p>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-8">
						<div className="space-y-3">
							<label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Blood Type Needed</label>
							<div className="relative group">
								<div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors">
									<Droplet className="w-5 h-5" />
								</div>
								<select
									name="blood_group"
									value={formData.blood_group}
									onChange={handleChange}
									className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-14 pr-5 py-4 text-white outline-none focus:border-rose-500 transition-all font-bold appearance-none cursor-pointer"
								>
									{["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
										<option key={group} value={group}>{group}</option>
									))}
								</select>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-3">
								<label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Units</label>
								<div className="relative group">
									<div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors">
										<Syringe className="w-5 h-5" />
									</div>
									<input
										type="number"
										min="1"
										name="units"
										value={formData.units}
										onChange={handleChange}
										className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-14 pr-5 py-4 text-white outline-none focus:border-rose-500 transition-all font-bold"
									/>
								</div>
							</div>

							<div className="space-y-3">
								<label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Urgency</label>
								<div className="relative group">
									<div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors">
										<Clock className="w-5 h-5" />
									</div>
									<select
										name="urgency"
										value={formData.urgency}
										onChange={handleChange}
										className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-14 pr-5 py-4 text-white outline-none focus:border-rose-500 transition-all font-bold appearance-none cursor-pointer"
									>
										<option value="normal">Normal</option>
										<option value="high">High</option>
										<option value="critical">Critical</option>
									</select>
								</div>
							</div>
						</div>

						{success && (
							<div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400 text-sm font-bold animate-in slide-in-from-top-2 duration-300">
								<CheckCircle className="w-5 h-5 shrink-0" />
								<span>{success}</span>
							</div>
						)}

						{error && (
							<div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in slide-in-from-top-2 duration-300">
								<AlertCircle className="w-5 h-5 shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<button
							type="submit"
							disabled={postRequestMutation.isPending}
							className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3"
						>
							{postRequestMutation.isPending ? (
								<>
									<Loader2 className="w-6 h-6 animate-spin" />
									Posting Request...
								</>
							) : (
								<>
									Post Request
									<PlusCircle className="w-6 h-6" />
								</>
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
