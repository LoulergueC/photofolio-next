/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import "./PhotoUpload.css";

import Button from "../Button/Button";
import { addPhotos } from "./handleInputFile";
import PhotoPreview from "./PhotoPreview";

export default function PhotoUpload() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<String[]>([]);

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

  const upload = async () => {
    const response = await fetch("/api/photos", {
      method: "POST",
      body: JSON.stringify(photos),
    });

    if (response.ok) {
      setPhotos([]);
    }
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
        <div
          className={"photo_uploader_container" + (photos.length > 0 ? " already_uploaded" : "")}>
          <label htmlFor="photos_uploader">
            <h2>Select {photos?.length > 0 ? "other" : ""} photos</h2>
            {photos?.length > 0 ? (
              <p>
                {photos.length} {photos.length === 1 ? "photo" : "photos"} uploaded
              </p>
            ) : (
              <p>
                By clicking here
                <br />
                or drag and drop
              </p>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              multiple
              onChange={(e) => addPhotos(e, setErrors, setPhotos)}
              id="photos_uploader"
              name="photos_uploader"
            />
          </label>
        </div>
        <div id="photos_preview">
          {photos &&
            photos.map((photo: Photo) => (
              <PhotoPreview
                key={photo.id}
                photo={photo}
                handleInputChange={handleInputChange}
                setPhotos={setPhotos}
              />
            ))}
        </div>
        {photos.length > 0 && (
          <div style={{ textAlign: "center", margin: "6rem 0" }}>
            <Button className="upload_button" onClick={upload} style={{ margin: "auto" }}>
              Upload photo{photos.length > 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export interface Photo {
  blob: string;
  buffer: Buffer;
  name: string;
  description: string;
  id: string;
  tags: Tag[];
  model: string;
  aperture: string;
  exposureTime: string;
  iso: string;
}

export interface Tag {
  name: string;
  id: number;
}
