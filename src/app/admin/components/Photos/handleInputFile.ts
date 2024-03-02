import { Photo } from "./PhotoUpload";
import { extractExif } from "./extractExif";
import { Dispatch, SetStateAction } from "react";

export const addPhotos = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setErrors: Dispatch<SetStateAction<String[]>>,
  setPhotos: Dispatch<SetStateAction<Photo[]>>
) => {
  event.preventDefault();
  if (event.target.files) {
    const photos = Array.from(event.target.files);
    const id = crypto.getRandomValues(new Uint32Array(2)).join("");

    // Cleanup all files not photos
    const cleanedPhotos = photos.filter((photo) => {
      if (
        photo.type === "image/jpeg" ||
        photo.type === "image/jpg" ||
        photo.type === "image/png" ||
        photo.type === "image/webp"
      )
        return true;
      setErrors((prevErrors) => {
        return [...prevErrors, `${photo.name} is not a valid photo (jpeg, png, webp)`];
      });
      return false;
    });

    const reader = (file: File): Promise<ArrayBuffer | null | string> =>
      new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = (err) => reject(err);
        fr.readAsArrayBuffer(file);
      });

    const promises = cleanedPhotos.map(async (photo) => {
      const exif = await extractExif(photo);

      const { model, aperture, exposureTime, iso, description } = exif;

      const arrayBuffer = await reader(photo);

      if (!arrayBuffer || typeof arrayBuffer === "string") {
        setErrors((prevErrors) => {
          return [...prevErrors, `${photo.name} could not be read`];
        });
        throw new Error(`${photo.name} could not be read`);
      }

      return {
        blob: URL.createObjectURL(photo),
        buffer: Buffer.from(arrayBuffer),
        name: photo.name,
        description: description,
        id: id,
        tags: [],
        model: model,
        aperture: aperture,
        exposureTime: exposureTime,
        iso: iso,
      };
    });

    const photosObjects = await Promise.all(promises);
    setPhotos((prevPhotos) => [...prevPhotos, ...photosObjects]);

    event.target.value = "";
  }
};
