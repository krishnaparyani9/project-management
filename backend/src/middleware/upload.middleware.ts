import multer from "multer";
import path from "path";

// Configure multer storage
const storage = multer.memoryStorage();

// File filter to accept only documents
const fileFilter = (
	_req: Express.Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	// Accept common document types
	const allowedMimes = [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		"text/plain",
		"image/jpeg",
		"image/png",
		"image/gif",
		"application/zip",
		"application/x-rar-compressed"
	];

	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error(`File type ${file.mimetype} not allowed`));
	}
};

export const uploadMiddleware = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 50 * 1024 * 1024 // 50MB limit
	}
});
