export class ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;

	constructor(success: boolean, message: string, data?: T) {
		this.success = success;
		this.message = message;
		this.data = data;
	}
}
