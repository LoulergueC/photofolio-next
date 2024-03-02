import { tagsAtom } from "@/app/lib/atoms/tagsAtom";
import { useAtom } from "jotai";
import { Tag } from "./PhotoUpload";
import Button from "../Button/Button";

import "./TagsModal.css";

export default function TagsModal({
  tagsAlreadySet,
  setTagsAlreadySet,
  setDisplayTagsModal,
}: {
  tagsAlreadySet: Tag[];
  setTagsAlreadySet: any;
  setDisplayTagsModal: any;
}) {
  const [tags, setTags] = useAtom(tagsAtom);

  if (!tags.length) {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((tags) => setTags(tags));
  }

  return (
    <div className="tags__modal">
      <div className="tags__modal__close" onClick={() => setDisplayTagsModal(false)}>
        <div></div>
        <div></div>
      </div>
      {tags.length > 0
        ? tags.map((tag) => (
            <div
              key={tag.id}
              className={"tag" + (tagsAlreadySet.find((t) => t.id === tag.id) ? " selected" : "")}
              onClick={() =>
                setTagsAlreadySet((tagsAlreadySet: Tag[]) => {
                  if (tagsAlreadySet.find((t) => t.id === tag.id))
                    return tagsAlreadySet.filter((t) => t.id !== tag.id);
                  return [...tagsAlreadySet, tag];
                })
              }>
              {tag.name}
            </div>
          ))
        : "No tags found"}
      <div className="tags__modal__footer">
        <Button onClick={() => setDisplayTagsModal(false)}>Save</Button>
      </div>
    </div>
  );
}
