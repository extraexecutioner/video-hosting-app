import { type Video } from './platform-menu'

export function calculateVideoLength(lengthInSeconds: number): string {
    const hours = Math.floor(lengthInSeconds / 3600);
    const minutes = Math.floor((lengthInSeconds % 3600) / 60);
    const seconds = lengthInSeconds % 60;
 
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
        return `${hours}:${paddedMinutes}:${paddedSeconds}`
    }

    return `${paddedMinutes}:${paddedSeconds}`
}

export async function searchVideos(name: string, controllerSignal: AbortSignal): Promise <[Video[], false] | [null, true]> {
    // fetch
    console.log(name, controllerSignal)
    return [[
        {
            name: "33",
            videoLength: 55,
            videoAvatarPath: "/"
        }
    ], false]
}

export async function logout() {

}