/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

import isoIcon from "../../../../../public/icons/iso.svg";
import modelIcon from "../../../../../public/icons/camera.svg";
import apertureIcon from "../../../../../public/icons/aperture.svg";
import exposureTimeIcon from "../../../../../public/icons/timer.svg";
import { Photo, Tag } from "./PhotoUpload";
import { useEffect, useState } from "react";
import TagsModal from "./TagsModal";

export default function PhotoPreview({ photo, setPhotos, handleInputChange, ...props }: any) {
  const [displayTagsModal, setDisplayTagsModal] = useState(false);
  const [tagsAlreadySet, setTagsAlreadySet] = useState<Tag[]>(photo.tags);

  useEffect(() => {
    setPhotos((photos: Photo[]) =>
      photos.map((p) => {
        if (p.id === photo.id) {
          return { ...p, tags: tagsAlreadySet };
        }
        return p;
      })
    );
  }, [tagsAlreadySet, photo.id, setPhotos]);

  return (
    <div className="photo-container">
      <div
        className="delete"
        onClick={() => setPhotos((photos: Photo[]) => photos.filter((p) => p.id !== photo.id))}>
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
            size={photo.name.length || 2}
          />
        </div>
        <div>
          <textarea
            name="description"
            placeholder="Description"
            id="description"
            data-id={photo.id}
            onChange={handleInputChange}
            rows={3}
            cols={30}
            value={photo.description}></textarea>
        </div>
      </div>

      <div className="tags" onClick={() => setDisplayTagsModal(true)}>
        {photo.tags.length > 0 ? (
          photo.tags.map((tag: Tag) => (
            <div className="tag" key={tag.id}>
              {tag.name}
            </div>
          ))
        ) : (
          <div>+ Tag</div>
        )}
      </div>
      {displayTagsModal && (
        <TagsModal
          tagsAlreadySet={tagsAlreadySet}
          setTagsAlreadySet={setTagsAlreadySet}
          setDisplayTagsModal={setDisplayTagsModal}
        />
      )}

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
            size={photo.model.length || 2}
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
            size={photo.aperture.length || 2}
          />
        </div>
        <div>
          <label htmlFor="exposureTime">
            <Image src={exposureTimeIcon} alt="exposureTime" />
          </label>
          <input
            type="text"
            name="exposureTime"
            id="exposureTime"
            data-id={photo.id}
            onChange={handleInputChange}
            value={photo.exposureTime}
            size={photo.exposureTime.length || 2}
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
            size={photo.iso.length || 2}
          />
        </div>
      </div>
    </div>
  );
}
