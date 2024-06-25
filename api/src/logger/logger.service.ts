import { Injectable, ConsoleLogger, Scope, LogLevel } from "@nestjs/common";
import * as util from 'util';

@Injectable({scope: Scope.TRANSIENT})
export class Loggary extends ConsoleLogger {
	private logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

	constructor(context: string, logLevels?: LogLevel[]) {
		super(context);
		if (logLevels) {
		this.logLevels = logLevels;
		}
	}
	setLogLevels(levels: LogLevel[]): void {
		this.logLevels = levels;
	}

	log(...messages: any[]) {
		if (this.logLevels.includes('log')) {
			const message = util.format(...messages);
			super.log(message);
		}
	}
	
	error(message: string, trace: string) {
		if (this.logLevels.includes('error')) {
			super.error(message, trace);
		}
	}
	
	warn(...messages: any[]) {
		if (this.logLevels.includes('warn')) {
			const message = util.format(...messages);
			super.warn(message);
		}
	}
	
	debug(...messages: any[]) {
		if (this.logLevels.includes('debug')) {
			const message = util.format(...messages);
			super.debug(message);
		}
	}
	
	verbose(...messages: any[]) {
		if (this.logLevels.includes('verbose')) {
			const message = util.format(...messages);
			super.verbose(message);
		}
	}
}