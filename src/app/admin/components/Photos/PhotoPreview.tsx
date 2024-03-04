/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

import isoIcon from "../../../../../public/icons/iso.svg";
import modelIcon from "../../../../../public/icons/camera.svg";
import apertureIcon from "../../../../../public/icons/aperture.svg";
import exposureTimeIcon from "../../../../../public/icons/timer.svg";
import { Photo, Tag, Model } from "./PhotoUpload";
import { useEffect, useState } from "react";
import TagsModal from "./TagsModal";
import { modelsAtom } from "@/app/lib/atoms/modelsAtom";
import { useAtom } from "jotai";

export default function PhotoPreview({ photo, setPhotos, handleInputChange, ...props }: any) {
  const [displayTagsModal, setDisplayTagsModal] = useState(false);
  const [tagsAlreadySet, setTagsAlreadySet] = useState<Tag[]>(photo.tags);
  const [models, setModels] = useAtom(modelsAtom);
  const [customModel, setCustomModel] = useState(false);

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

  useEffect(() => {
    if (!models.length) {
      fetch("/api/models")
        .then((res) => res.json())
        .then((models) => setModels(models));
    }
  }, [models.length, setModels]);

  useEffect(() => {
    const modelExists = models.some((model) => model.name === photo.model.name);
    if (modelExists) {
      setPhotos((photos: Photo[]) =>
        photos.map((p) => {
          if (p.id === photo.id) {
            return { ...p, model: models.find((model) => model.name === photo.model.name) };
          }
          return p;
        })
      );
    }

    setCustomModel(!modelExists);
  }, [models, photo.id, photo.model, setPhotos, setCustomModel]);

  const handleSelectModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelName = e.target.value;

    if (modelName === "addNewModel") return setCustomModel(true);

    setCustomModel(false);

    const modelId = models.find((model) => model.name === modelName)?.id;

    setPhotos((photos: Photo[]) =>
      photos.map((p) => {
        if (p.id === photo.id) {
          return { ...p, model: { name: modelName, id: modelId } };
        }
        return p;
      })
    );
  };

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
          <label htmlFor="modelSelect">
            <Image src={modelIcon} alt="model" />
          </label>
          <div className="model__select">
            <select
              name="model"
              id="modelSelect"
              data-id={photo.id}
              onChange={handleSelectModel}
              value={photo.model.name || "addNewModel"}>
              <option value="addNewModel" onSelect={() => setCustomModel(true)}>
                New model
              </option>
              {models.length > 0 &&
                models.map((model: Model) => (
                  <option key={model.id} value={model.name}>
                    {model.name}
                  </option>
                ))}
            </select>
            {customModel && (
              <input
                type="text"
                name="model"
                data-id={photo.id}
                onChange={handleInputChange}
                value={photo.model.name}
                size={photo.model.length || 2}
              />
            )}
          </div>
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
