import JSZip from 'jszip';

const extractZipContent = async (file: File): Promise<File[]> => {
  const zip = new JSZip();
  const content = await file.arrayBuffer();
  const zipFile = await zip.loadAsync(content);
  return Promise.all(
    Object.keys(zipFile.files)
      .map((fileName) => zipFile.files[fileName])
      .filter((f) => !f.dir)
      .map(async (f) => new File([await f.async('blob')], f.name)),
  );
};

export default extractZipContent;
