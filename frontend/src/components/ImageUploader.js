"use client";
import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function ImageUploader({ images = [], onChange, maxImages = 5 }) {
  const [uploading, setUploading] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const checkIsLandscape = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        // Landscape if width is greater than or equal to height
        resolve(img.width >= img.height);
      };
      img.onerror = () => {
        resolve(false);
      };
    });
  };

  const processFiles = async (files) => {
    if (images.length + files.length > maxImages) {
        showToast(`You can only upload up to ${maxImages} images.`, "error");
        const allowedCount = maxImages - images.length;
        files = files.slice(0, allowedCount);
    }

    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
            showToast(`File "${file.name}" is too large (max 5MB).`, "error");
            continue;
        }

        const isLandscape = await checkIsLandscape(file);
        if (!isLandscape) {
            showToast(`"${file.name}" is a portrait/vertical image. Please upload landscape (horizontal) images only.`, "error");
            continue;
        }

        await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    setUploading(prev => [...prev, { id: fileId, name: file.name, progress: 0 }]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/uploads/image");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploading(prev => prev.map(u => u.id === fileId ? { ...u, progress } : u));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            onChange([...images, data.url]);
          } else {
            const err = JSON.parse(xhr.responseText);
            showToast(err.detail || "Upload failed", "error");
          }
          setUploading(prev => prev.filter(u => u.id !== fileId));
          resolve();
        };

        xhr.onerror = () => {
          showToast("Network error during upload", "error");
          setUploading(prev => prev.filter(u => u.id !== fileId));
          resolve();
        };

        xhr.send(formData);
      });
    } catch (err) {
      console.error(err);
      setUploading(prev => prev.filter(u => u.id !== fileId));
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <AnimatePresence>
          {Array.isArray(images) && images.map((img, idx) => (
            <motion.div 
              key={img}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative w-20 h-20 rounded-xl overflow-hidden group shadow-sm border border-black/5"
            >
              <img src={img.startsWith('http') || img.startsWith('data:') ? img : `${img}`} className="w-full h-full object-cover" alt="Preview" />
              <button 
                onClick={(e) => { e.preventDefault(); removeImage(idx); }}
                className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 smooth-transition hover:bg-red-600 z-10"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
          
          {uploading.map(u => (
            <div key={u.id} className="w-20 h-20 rounded-xl bg-surface border border-black/5 flex flex-col items-center justify-center p-2 relative overflow-hidden shadow-sm">
                <Loader2 className="w-5 h-5 text-primary animate-spin mb-1" />
                <span className="text-[8px] text-gray-400 truncate w-full text-center">{u.name}</span>
                <div className="absolute bottom-0 left-0 h-[3px] bg-primary smooth-transition" style={{ width: `${u.progress}%` }} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {images.length < maxImages && (
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
          className={`h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer smooth-transition ${
            isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-primary/30 bg-surface hover:bg-primary/5 hover:border-primary/50"
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 smooth-transition">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-secondary">Drag photos here or click to browse</p>
            <p className="text-xs text-gray-400">JPG, PNG or WEBP (Landscape only, Max 5MB)</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            hidden 
            accept="image/*"
          />
        </div>
      )}
    </div>
  );
}
