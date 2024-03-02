import { Tag } from "@/app/admin/components/Photos/PhotoUpload";
import { atom } from "jotai";

export const tagsAtom = atom<Tag[]>([]);
