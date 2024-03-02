import ExifReader from "exifreader";

export const extractExif = async (file: File) => {
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
