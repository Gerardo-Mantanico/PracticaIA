import React from "react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  helperText?: string;
  buttonText?: string;
  emptyText?: string;
  previewHeightClassName?: string;
  accept?: string;
}

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });

export default function ImageUploader({
  images,
  onChange,
  multiple = false,
  helperText,
  buttonText = "Seleccionar foto",
  emptyText,
  previewHeightClassName = "h-24",
  accept = "image/*",
}: Readonly<ImageUploaderProps>) {
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImages = await Promise.all(files.map(toBase64));
    onChange(multiple ? [...images, ...newImages] : [newImages[0]]);
    e.target.value = "";
  };

  const handleRemoveImg = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
      <label className="flex cursor-pointer flex-col items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {helperText ??
            (multiple
              ? "Haz clic para seleccionar fotos (puedes elegir varias)"
              : "Haz clic para seleccionar una foto")}
        </span>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleFilesChange}
        />
        <span className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600">
          {buttonText}
        </span>
      </label>

      {images.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {images.map((img, index) => (
            <div key={`${img.slice(0, 24)}-${index}`} className="group relative">
              {img.startsWith("data:application/pdf") ? (
                <div className={`flex w-full ${previewHeightClassName} items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300`}>
                  PDF adjunto
                </div>
              ) : (
                <img
                  src={img}
                  alt={`Imagen ${index + 1}`}
                  className={`w-full ${previewHeightClassName} rounded-lg object-cover`}
                />
              )}
              <button
                type="button"
                onClick={() => handleRemoveImg(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        emptyText && (
          <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            {emptyText}
          </p>
        )
      )}
    </div>
  );
}
