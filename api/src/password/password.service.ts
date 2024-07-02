import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
    private roomPasswords: Record<string, string> = {};

    setPassword(roomId: string, password: string): void {
        this.roomPasswords[roomId] = password;
    }

    getPassword(roomId: string): string | undefined {
        return this.roomPasswords[roomId];
    }

    validatePassword(roomId: string, providedPassword: string): boolean {
        const storedPassword = this.roomPasswords[roomId];
        if (!storedPassword) {
            return false;
        }
		if (storedPassword == providedPassword)
			return true;
		return false;
        // return compareSync(providedPassword, storedPassword);
    }
}