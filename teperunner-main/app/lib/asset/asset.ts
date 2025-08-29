/*
Example usage:
const url = await uploadFileClient(data.file as File, data.file!.name, data.fileType as string)
*/

export default async function uploadFileClient(
  file: File,
  fileName: string,
  folder: string
): Promise<{ success: boolean; url?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);
  formData.append('folder', folder);

  const uploadResponse = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!uploadResponse.ok) {
    return { success: false };
  }

  const uploadData: {
    success: boolean;
    url?: string;
  } = await uploadResponse.json();

  return uploadData;
}

export const getAsset = (key: string): string => {
  const cleanedKey = key.replace(/^\/|\/$/g, '');
  const url = `https://compfest-17.s3.ap-southeast-1.amazonaws.com/assets/${cleanedKey}`;

  return url;
};
