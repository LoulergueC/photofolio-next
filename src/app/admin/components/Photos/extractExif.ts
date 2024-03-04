import ExifReader from "exifreader";

export const extractExif = async (file: File) => {
  try {
    const tags = await ExifReader.load(file, { expanded: true });

    if (tags.exif && tags.file) {
      const { Model, FNumber, ExposureTime, ISOSpeedRatings, ImageDescription } = tags.exif;
      const model = Model?.description || "";
      const aperture = FNumber?.description || "";
      const exposureTime = ExposureTime?.description || "";
      const iso = ISOSpeedRatings?.description || "";
      const description = ImageDescription?.description || "";
      const { ["Image Height"]: heightFile, ["Image Width"]: widthFile } = tags.file;
      const width = widthFile?.value || 0;
      const height = heightFile?.value || 0;
      return { model, aperture, exposureTime, iso, description, height, width };
    } else {
      return {
        model: "",
        aperture: "",
        exposureTime: "",
        iso: "",
        description: "",
        height: 0,
        width: 0,
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
      height: 0,
      width: 0,
    };
  }
};
