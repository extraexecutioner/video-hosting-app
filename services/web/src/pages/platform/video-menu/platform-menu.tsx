import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { calculateVideoLength, searchVideos, logout } from './platform-menu-handler'

export interface Video {
    name: string;
    videoLength: number;
    videoAvatarPath: string;
}

function VideoComponent({videoConfig}: {videoConfig: Video}): React.JSX.Element {
    return (
        <li key={1}>
            <p className="name">{videoConfig.name}</p>
            <p className="length">{calculateVideoLength(videoConfig.videoLength)}</p>
        </li>
    )
}

export default function VideoMenu(): React.JSX.Element {
    const navigate = useNavigate()
    const controller = useRef <AbortController | null> (null)
    const [videos, setVideos] = useState <Video[]> ([])

    useEffect(() => {
        if (controller.current) return

        const newController = new AbortController()
        controller.current = newController

        const getVideos = async () => {
            const [videos, aborted] = await searchVideos("", newController.signal)
            if (aborted) return

            if (controller.current === newController) {
                controller.current = null
            }
            
            setVideos(videos)
        }

        getVideos()

        return () => {
            if (controller.current) {
                controller.current.abort()
            }
        }
    }, [])

    const handleSearch = async (event: React.SubmitEvent<HTMLFormElement>) => {
        if (controller.current) {
            controller.current.abort()
        }

        event.preventDefault()

        const currentTargetValue = (new FormData(event.currentTarget)).get("search-bar")
        if (!currentTargetValue || typeof currentTargetValue !== "string") throw new Error(`No current target found!`)

        controller.current = new AbortController()
        const [videosResult, aborted] = await searchVideos(currentTargetValue, controller.current.signal)

        controller.current = null
        if (aborted) return

        setVideos(videosResult)
    }

    return (
        <section className="platform-menu-section">
            <header>
                <h1>Watch videos</h1>
                <h2>video-hosting-app</h2>
                <button onClick={logout}>Logout</button>
            </header>
            <main>
                <section className="controls-section">
                    <form className="search-bar" onSubmit={handleSearch}>
                        <label htmlFor="search-bar">Search:</label>
                        <input id="search-bar" name="search-bar" type="text" placeholder="search-bar"/>
                        <button type="submit">Search</button>
                    </form>
                    <button type="button" onClick={() => navigate("/videos/upload", { replace: true })}>Upload</button>
                </section>
                <ul className="videos-ul-element">
                    {videos.map(video => <VideoComponent videoConfig={video}/>)}
                </ul>
            </main>
        </section>
    )
}