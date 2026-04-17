import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const getPidOnPort = async (port: number): Promise<number | null> => {
	try {
		if (process.platform === "win32") {
			const command = `$conn = Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -First 1; if ($conn) { $conn.OwningProcess }`;
			const { stdout } = await execFileAsync("powershell", ["-NoProfile", "-Command", command]);
			const parsed = Number(stdout.trim());
			return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
		}

		const { stdout } = await execFileAsync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"]);
		const parsed = Number(stdout.split(/\r?\n/)[0]?.trim());
		return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
	} catch {
		return null;
	}
};

const getProcessName = async (pid: number): Promise<string | null> => {
	try {
		if (process.platform === "win32") {
			const command = `$p = Get-Process -Id ${pid} -ErrorAction SilentlyContinue; if ($p) { $p.ProcessName }`;
			const { stdout } = await execFileAsync("powershell", ["-NoProfile", "-Command", command]);
			const name = stdout.trim().toLowerCase();
			return name || null;
		}

		const { stdout } = await execFileAsync("ps", ["-p", String(pid), "-o", "comm="]);
		const name = stdout.trim().toLowerCase();
		return name || null;
	} catch {
		return null;
	}
};

const killProcess = async (pid: number): Promise<void> => {
	if (process.platform === "win32") {
		await execFileAsync("taskkill", ["/PID", String(pid), "/F"]);
		return;
	}

	await execFileAsync("kill", ["-9", String(pid)]);
};

export const ensurePortIsFreeForDev = async (port: number, enabled: boolean): Promise<void> => {
	if (!enabled) {
		return;
	}

	const pid = await getPidOnPort(port);
	if (!pid || pid === process.pid) {
		return;
	}

	const processName = await getProcessName(pid);
	if (processName !== "node") {
		return;
	}

	// Kill stale Node listeners left by prior local runs so dev server can bind reliably.
	await killProcess(pid);
};
