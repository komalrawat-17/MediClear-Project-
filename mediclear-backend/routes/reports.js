import express from "express";
import multer from "multer";

const router = express.Router();

// multer needs to know where to temporarily store uploaded files.
// "memoryStorage" keeps the file in RAM instead of writing it to disk —
// good enough for now since we're not processing it yet, just confirming receipt.
const upload = multer({ storage: multer.memoryStorage() });

// POST /reports/analyze — accepts one file under the field name "report"
router.post("/analyze", upload.single("report"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file was uploaded." });
    }

    res.status(200).json({
        message: "File received successfully.",
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSizeKB: Math.round(req.file.size / 1024),
    });
});

export default router;