import multer from 'multer';

// AWS S3 업로드 제거하고 임시로 로컬 메모리 저장 방식으로 변경
const storage = multer.memoryStorage();

export const uploadImage = (fieldName: string) => {
  return multer({ storage }).single(fieldName);
};

