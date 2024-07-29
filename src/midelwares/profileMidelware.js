import multer from 'multer';

const upload = multer({
  dest: './public/data/uploads/',
  limits: { fileSize: 3e7 }, // 30 MB
});

export default upload;