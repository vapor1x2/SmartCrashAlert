const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { detectNearbyFacilities, logCrashReport } = require("../Services/alertService");

router.post("/upload", upload.fields([
  { name: "file1", maxCount: 1 },
  { name: "file2", maxCount: 1 },
  { name: "file3", maxCount: 1 }
]), async (req, res) => {
  try {
    // Handle coordinates
    let coordinates;
    try {
      coordinates = JSON.parse(req.body.coordinates);
    } catch (e) {
      return res.status(400).json({ error: "Format koordinat tidak valid. Gunakan format JSON array: [longitude, latitude]" });
    }
    
    // Validasi koordinat
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: "Koordinat harus berupa array [longitude, latitude]" });
    }

    // 🔍 Cari fasilitas terdekat
    const facilities = await detectNearbyFacilities(coordinates);

    // 🧾 Simpan laporan ke DB
    const files = req.files 
      ? Object.values(req.files).flatMap(fileArray => fileArray)
      : [];
      
    await logCrashReport(coordinates, facilities, files);

    console.log("🚨 Laporan diterima! Notifikasi WhatsApp terkirim");

    res.status(200).json({
      message: "Laporan berhasil diterima",
      fasilitas: facilities.map(f => ({
        id: f._id,
        nama: f.nama,
        jenis: f.constructor.modelName
      })),
      files: files.map(f => f.filename)
    });

   } catch (err) {
    console.error("🚫 Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;