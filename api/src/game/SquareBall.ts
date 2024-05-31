export class SquareBall
{
	position: number[] = [400,300];
	speed: number[] = [10, 0];

	move()
	{
		this.position[0] += this.speed[0];
		this.position[1] += this.speed[1];
	}
}

// export function calcDiff(posOne: number[], posTwo: number[]): number
// {
// 	return(
// 	(posOne[0] - posTwo[0])*(posOne[0] - posTwo[0]) +
// 	(posOne[1] - posTwo[1])*(posOne[1] - posTwo[1]));
// }