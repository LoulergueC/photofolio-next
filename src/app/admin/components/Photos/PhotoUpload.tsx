/* eslint-disable @next/next/no-img-element */
"use client";
import * as ExifReader from "exifreader";
import { useEffect, useState } from "react";
import "./PhotoUpload.css";
import Image from "next/image";

import isoIcon from "../../../../../public/icons/iso.svg";
import modelIcon from "../../../../../public/icons/camera.svg";
import apertureIcon from "../../../../../public/icons/aperture.svg";
import exposureTimeIcon from "../../../../../public/icons/timer.svg";

export default function PhotoUpload() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<String[]>([]);

  const addPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      const promises = cleanedPhotos.map(async (photo) => {
        const exif = await extractExif(photo);

        const { model, aperture, exposureTime, iso, description } = exif;
        return {
          blob: URL.createObjectURL(photo),
          name: photo.name,
          description: description,
          id: id,
          tags: "",
          model: model,
          aperture: aperture,
          exposureTime: exposureTime,
          iso: iso,
        };
      });

      // Use Promise.all to wait for all promises to resolve
      const photosObjects = await Promise.all(promises);

      // Now you can safely set the photos state with the resolved values
      setPhotos((prevPhotos) => [...prevPhotos, ...photosObjects]);
    }
  };

  const extractExif = async (file: File) => {
    try {
      const tags = await ExifReader.load(file, { expanded: true });

      if (tags.exif) {
        const { Model, FNumber, ExposureTime, ISOSpeedRatings, ImageDescription } = tags.exif;
        const model = Model?.description || "";
        const aperture = FNumber?.description || "";
        const exposureTime = ExposureTime?.description || "";
        const iso = ISOSpeedRatings?.description || "";
        const description = ImageDescription?.description || "";
        return { model, aperture, exposureTime, iso, description };
      } else {
        return {
          model: "",
          aperture: "",
          exposureTime: "",
          iso: "",
          description: "",
        };
      }
    } catch (error) {
      console.error("Failed to extract EXIF data:", error);
      return {
        model: "",
        aperture: "",
        exposureTime: "",
        iso: "",
        description: "",
      };
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const id = event.target.dataset.id;
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) => {
        if (photo.id === id) {
          return { ...photo, [name]: value };
        }
        return photo;
      })
    );
  };

  return (
    <>
      <div>
        {errors?.length > 0 && (
          <div className="errors">
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
        <h1>Photo Upload</h1>
        <label htmlFor="photos_uploader">Upload Photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={addPhotos}
          name="photos"
          id="photos_uploader"
          style={{ display: "none" }}
        />
        <div id="photos_preview">
          {photos &&
            photos.map((photo: Photo) => (
              <div className="photo-container" key={photo.id}>
                {/* // eslint-disable-next-line @next/next/no-img-element */}
                <div
                  className="delete"
                  onClick={() => setPhotos(photos.filter((p) => p.id !== photo.id))}>
                  <div></div>
                  <div></div>
                </div>
                <img src={photo.blob} alt={photo.name} />
                <div className="photo-details">
                  <div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      data-id={photo.id}
                      onChange={handleInputChange}
                      value={photo.name}
                    />
                  </div>
                  <div>
                    <textarea
                      name="description"
                      placeholder="Description"
                      id="description"
                      data-id={photo.id}
                      onChange={handleInputChange}
                      value={photo.description}></textarea>
                  </div>
                </div>

                <div className="camera-details">
                  <div>
                    <label htmlFor="model">
                      <Image src={modelIcon} alt="model" />
                    </label>
                    <input
                      type="text"
                      name="model"
                      id="model"
                      data-id={photo.id}
                      onChange={handleInputChange}
                      value={photo.model}
                    />
                  </div>
                  <div>
                    <label htmlFor="aperture">
                      <Image src={apertureIcon} alt="aperture" />
                    </label>
                    <input
                      type="text"
                      name="aperture"
                      id="aperture"
                      data-id={photo.id}
                      onChange={handleInputChange}
                      value={photo.aperture}
                    />
                  </div>
                  <div>
                    <label htmlFor="exposureTime">
                      <Image src={exposureTimeIcon} alt="exposureTime" />
                    </label>
                    <input
                      type="text"
                      name="exposureTime"
                      id="exposure"
                      data-id={photo.id}
                      onChange={handleInputChange}
                      value={photo.exposureTime}
                    />
                  </div>
                  <div>
                    <label htmlFor="iso">
                      <Image src={isoIcon} alt="iso" />
                    </label>
                    <input
                      type="text"
                      name="iso"
                      id="iso"
                      data-id={photo.id}
                      onChange={handleInputChange}
                      value={photo.iso}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

interface Photo {
  blob: string;
  name: string;
  description: string;
  id: string;
  tags: string;
  model: string;
  aperture: string;
  exposureTime: string;
  iso: string;
}
