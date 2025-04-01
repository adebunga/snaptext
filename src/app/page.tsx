"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, FileText } from "lucide-react";
import { createWorker } from 'tesseract.js';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset states
      setError(null);
      setExtractedText("");
      setIsProcessing(true);
      
      try {
        // Show image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Process image with Tesseract.js
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();

        if (!text || text.trim().length === 0) {
          throw new Error('No text could be extracted from this image');
        }

        setExtractedText(text.trim());
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Error processing image. Please try again.');
        setExtractedText('');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Add drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = document.createElement('input');
      input.files = e.dataTransfer.files;
      handleImageUpload({ target: input } as any);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Image to Text</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Image Upload */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div 
              className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {selectedImage ? (
                <div className="relative w-full h-[400px]">
                  <Image
                    src={selectedImage}
                    alt="Uploaded image"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-center p-6">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer rounded-md bg-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
                    >
                      Upload Image
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">or drop an image file</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Extracted Text */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-800">Extracted Text</h2>
            </div>
            <div className="min-h-[400px] border rounded-lg p-4 bg-gray-50">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-sm text-gray-500">Processing image...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-4 text-sm text-blue-500 hover:text-blue-600"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-gray-700">
                  {extractedText || "Upload an image to see extracted text here..."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
