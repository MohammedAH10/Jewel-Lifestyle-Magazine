import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NominationForm() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nominee_name: "",
    nominee_title: "",
    nominee_company: "",
    award_category: "",
    your_name: "",
    your_email: "",
    reason: "",
    supporting_links: "",
    year: new Date().getFullYear(),
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await api.get("/awards/categories");
        setCategories(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  function validate() {
    const errors = {};
    if (!formData.nominee_name.trim()) errors.nominee_name = "Nominee name is required";
    if (!formData.award_category) errors.award_category = "Please select an award category";
    if (!formData.your_name.trim()) errors.your_name = "Your name is required";
    if (!formData.your_email.trim()) {
      errors.your_email = "Your email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.your_email)) {
      errors.your_email = "Please enter a valid email address";
    }
    if (!formData.reason.trim()) errors.reason = "Reason for nomination is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post("/awards/nominations", formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-black pt-32 pb-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle className="w-20 h-20 text-gold mx-auto mb-6" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-gilda text-4xl md:text-5xl text-gold mb-4">
              Nomination Submitted Successfully
            </h1>
            <p className="text-white/60 text-lg mb-8">
              Thank you for your nomination. Our team will review it shortly.
            </p>
            <Link
              to={createPageUrl("Spotlight Awards")}
              className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Spotlight Awards
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          to={createPageUrl("Spotlight Awards")}
          className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Spotlight Awards
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-gilda text-5xl md:text-6xl text-gold mb-4">
            Submit a Nomination
          </h1>
          <p className="text-white/60 text-lg mb-10">
            Recognize an outstanding individual or organization in the Jewel community.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg px-6 py-4 mb-8"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-white/40 text-xs tracking-widest uppercase font-medium">
              Nominee Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nominee_name" className="text-white/70">
                  Nominee Name <span className="text-gold">*</span>
                </Label>
                <Input
                  id="nominee_name"
                  value={formData.nominee_name}
                  onChange={(e) => handleChange("nominee_name", e.target.value)}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold ${
                    fieldErrors.nominee_name ? "border-red-500" : ""
                  }`}
                  placeholder="Full name"
                />
                {fieldErrors.nominee_name && (
                  <p className="text-red-400 text-xs">{fieldErrors.nominee_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="award_category" className="text-white/70">
                  Award Category <span className="text-gold">*</span>
                </Label>
                <Select
                  value={formData.award_category}
                  onValueChange={(val) => handleChange("award_category", val)}
                >
                  <SelectTrigger
                    className={`bg-white/5 border-white/10 text-white focus:ring-gold ${
                      fieldErrors.award_category ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        loadingCategories ? "Loading categories..." : "Select category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id || cat.name} value={cat.id || cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.award_category && (
                  <p className="text-red-400 text-xs">{fieldErrors.award_category}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nominee_title" className="text-white/70">
                  Nominee Title
                </Label>
                <Input
                  id="nominee_title"
                  value={formData.nominee_title}
                  onChange={(e) => handleChange("nominee_title", e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold"
                  placeholder="e.g. CEO, Founder"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nominee_company" className="text-white/70">
                  Nominee Company
                </Label>
                <Input
                  id="nominee_company"
                  value={formData.nominee_company}
                  onChange={(e) => handleChange("nominee_company", e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold"
                  placeholder="Company or organization"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-white/40 text-xs tracking-widest uppercase font-medium">
              Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="your_name" className="text-white/70">
                  Your Name <span className="text-gold">*</span>
                </Label>
                <Input
                  id="your_name"
                  value={formData.your_name}
                  onChange={(e) => handleChange("your_name", e.target.value)}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold ${
                    fieldErrors.your_name ? "border-red-500" : ""
                  }`}
                  placeholder="Your full name"
                />
                {fieldErrors.your_name && (
                  <p className="text-red-400 text-xs">{fieldErrors.your_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="your_email" className="text-white/70">
                  Your Email <span className="text-gold">*</span>
                </Label>
                <Input
                  id="your_email"
                  type="email"
                  value={formData.your_email}
                  onChange={(e) => handleChange("your_email", e.target.value)}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold ${
                    fieldErrors.your_email ? "border-red-500" : ""
                  }`}
                  placeholder="you@example.com"
                />
                {fieldErrors.your_email && (
                  <p className="text-red-400 text-xs">{fieldErrors.your_email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-white/40 text-xs tracking-widest uppercase font-medium">
              Nomination Details
            </h2>
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-white/70">
                Reason for Nomination <span className="text-gold">*</span>
              </Label>
              <Textarea
                id="reason"
                rows={5}
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold resize-none ${
                  fieldErrors.reason ? "border-red-500" : ""
                }`}
                placeholder="Tell us why this person or organization deserves the award..."
              />
              {fieldErrors.reason && (
                <p className="text-red-400 text-xs">{fieldErrors.reason}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supporting_links" className="text-white/70">
                Supporting Links
              </Label>
              <Input
                id="supporting_links"
                value={formData.supporting_links}
                onChange={(e) => handleChange("supporting_links", e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold"
                placeholder="https:// (optional)"
              />
              <p className="text-white/30 text-xs">
                Links to portfolio, social media, or relevant work
              </p>
            </div>

            <input type="hidden" name="year" value={formData.year} />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-gold text-black font-medium tracking-wider uppercase text-sm hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Nomination
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
