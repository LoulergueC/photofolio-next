import { tagsAtom } from "@/app/lib/atoms/tagsAtom";
import { useAtom } from "jotai";
import { useState } from "react";
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
  const [addTag, setAddTag] = useState(false);

  if (!tags.length) {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((tags) => setTags(tags));
  }

  const addTagHandler = (e: React.FormEvent) => {
    e.preventDefault();

    const tagName = (e.currentTarget.querySelector('input[name="tagName"]') as HTMLInputElement)
      .value;
    if (!tagName) return setAddTag(false);

    fetch("/api/tags", {
      method: "POST",
      body: JSON.stringify({
        name: tagName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAddTag(false);
        setTags([...tags, data]);
      });

    // TODO: Add error handling
  };

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
        {addTag ? (
          <form onSubmit={addTagHandler}>
            <input type="text" name="tagName" placeholder="Tag Name" />
            <Button type="submit" fontSize={"1rem"}>
              Add
            </Button>
          </form>
        ) : (
          <Button onClick={() => setAddTag(true)} prefix="+" fontSize={"1rem"}>
            Tag
          </Button>
        )}
        <Button onClick={() => setDisplayTagsModal(false)} fontSize={"1rem"}>
          Save
        </Button>
      </div>
    </div>
  );
}
