import { useRef, useState } from "react";
import apiClient from "../../api/apiClient";
import { useUI } from "../../context/UIContext";

export const ImageUpload = ({
  label = "Image",
  value = "",
  onChange,
  folder = "methynix-website (new)",
  hint = "Select an image from your computer to store in Cloudflare R2.",
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useUI();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again if needed
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file (PNG, JPG, WebP, etc.).", "error");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast("Image is too large. Maximum size is 20MB.", "error");
      return;
    }

    setUploading(true);

    try {
      // Read file into Base64 Data URL
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to Cloudflare R2 via admin API
      const res = await apiClient.post("/admin/upload", {
        data: dataUrl,
        filename: file.name,
        contentType: file.type,
        folder,
      });

      const publicUrl = res.data?.data?.url;
      if (publicUrl) {
        onChange(publicUrl);
        showToast("Image uploaded to Cloudflare R2!");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to upload image.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-xs font-medium text-dim">{label}</span>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="rounded-xl border border-line bg-ink/60 p-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-line bg-black/40 shrink-0 flex items-center justify-center">
            <img src={value} alt="Uploaded thumbnail" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-dim break-all line-clamp-2">{value}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs px-2.5 py-1 rounded bg-raised border border-line hover:border-accent text-text transition-colors"
              >
                {uploading ? "Uploading…" : "Replace image"}
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="text-xs px-2.5 py-1 rounded text-red-300 hover:text-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center gap-2 ${
            uploading
              ? "border-accent/50 bg-accent/5 cursor-wait"
              : "border-line hover:border-accent bg-ink/40 hover:bg-ink/70"
          }`}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-dim">Uploading to Cloudflare R2 ({folder})…</p>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-dim mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium text-text">Click to choose image from your computer</p>
              <p className="text-xs text-faint">PNG, JPG, WEBP, GIF up to 20MB</p>
            </>
          )}
        </div>
      )}

      {hint ? <span className="text-xs text-faint">{hint}</span> : null}
    </div>
  );
};

