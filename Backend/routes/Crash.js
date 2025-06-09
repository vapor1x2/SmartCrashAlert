const express = require("express");
const router = express.Router();
const { detectNearbyFacilities,logCrashReport} = require("../services/alertService");

router.post("/", async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    // Validasi input
    if (!coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ error: "Format koordinat tidak valid" });
    }
    
    // 1. Cari fasilitas terdekat
    const facilities = await detectNearbyFacilities(coordinates);
    
    // 2. Simpan laporan
    await logCrashReport(coordinates, facilities);
    
    // 3. Response
    res.status(201).json({
      success: true,
      message: "Laporan kecelakaan berhasil direkam",
      facilities: facilities.map(f => ({
        id: f._id,
        nama: f.nama,
        jenis: f.constructor.modelName
      }))
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;