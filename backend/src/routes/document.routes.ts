import { Router } from "express";
import {
	uploadDocument,
	getGroupDocuments,
	getAllAccessibleDocuments,
	deleteDocument,
	getDocumentDownloadUrl
} from "../controllers/document.controller";
import { authenticate } from "../middleware/auth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload a document to a group
router.post("/upload", uploadMiddleware.single("file"), uploadDocument);

// Get all documents of a specific group
router.get("/group/:groupId", getGroupDocuments);

// Get all documents accessible to the current user
router.get("/", getAllAccessibleDocuments);

// Get download URL for a document
router.get("/download/:documentId", getDocumentDownloadUrl);

// Delete a document
router.delete("/:documentId", deleteDocument);

export default router;
