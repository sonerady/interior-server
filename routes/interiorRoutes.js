const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const interiorController = require("../controllers/interiorController");

// Dosya yükleme için yapılandırma
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB maksimum dosya boyutu
  fileFilter: function (req, file, cb) {
    // Sadece resim dosyalarını kabul et
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new Error("Sadece JPG, JPEG ve PNG dosyaları yüklenebilir!"),
        false
      );
    }
    cb(null, true);
  },
});

// İç mekan tasarımı oluşturma route'u
router.post(
  "/generate-interior",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "mask", maxCount: 1 },
  ]),
  interiorController.generateInterior
);

// İç mekan tasarımı oluşturma route'u (URL'lerden)
router.post(
  "/generate-interior-from-url",
  interiorController.generateInteriorFromUrl
);

// Görüntü iyileştirme route'u (Clarity Upscaler)
router.post("/enhance-image", interiorController.enhanceImageWithClarity);

// Tahmin durumu kontrol route'u
router.get(
  "/prediction-status/:predictionId",
  interiorController.checkPredictionStatus
);

// Gemini ile prompt oluşturma route'u
router.post("/generate-prompt", interiorController.generatePromptWithGemini);

// Resim yükleme endpoint'i
router.post("/upload-image", interiorController.uploadImage);

module.exports = router;
