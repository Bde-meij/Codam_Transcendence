import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	BadRequestException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ErrorMessage } from './chatRoom.dto';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
	catch(exception: WsException, host: ArgumentsHost) {
		const client = host.switchToWs().getClient();
		this.handleError(client, exception);
	}

	public handleError<TClient extends { emit }> (client: TClient, exception: WsException) {
		var e_msg: ErrorMessage = {
			status_code: 0,
			msg: "Error message undefined",
			room: 0,
		};
		if (exception instanceof BadRequestException) {
			let response = exception.getResponse();
			e_msg.status_code = exception.getStatus();
			let responses: string | object = exception.getResponse();
			// console.log(response);
			try {
				if (typeof responses === 'string') {
					responses = JSON.parse(responses);
					e_msg.msg = (response as string);
				}
				if (typeof responses === 'object' && responses !== null) {
					const responsesObject = responses as { message?: string[] };
					if (responsesObject.message && Array.isArray(responsesObject.message)) {
						e_msg.msg = responsesObject.message[0];
					} else {
						e_msg.msg = "Error message undefined";
					}
				}
				if ((client as any).data.room)
					e_msg.room = (client as any).data.room;
				client.emit('error_message', e_msg);
				return;

			} catch (error) {
				console.log("Error handling responses:", error);
			}
		}
		console.log(exception);
		console.log("WsExceptionFilter unexpected error");
	}
}
