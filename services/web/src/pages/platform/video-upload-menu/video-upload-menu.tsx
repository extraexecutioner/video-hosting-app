import type React from 'react';
import { useNavigate } from 'react-router-dom'

import uploadVideo from './video-upload-menu.handler'

export default function VideoUploadMenu(): React.JSX.Element {
    const navigate = useNavigate()

    const onVideoFilesChanged = (type: "video" | "image", event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return 

        const firstFile = files.item(0) as File
        const allowedTypes = type === "video" ? ["mp4", "matroska"] : ["png"]

        const fullFileType = firstFile.type
        const lastIndex = fullFileType.lastIndexOf("/")

        if (lastIndex === -1) { 
            event.currentTarget.value  = '' 
            return 
        }

        const currentType = fullFileType.slice(lastIndex + 1)

        if (!allowedTypes.includes(currentType)) {
            event.currentTarget.value  = ''
            return
        }

        if (files.length > 1) {
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(firstFile)

            event.currentTarget.files = dataTransfer.files
        }
    } 

    return (
        <section className="video-upload-menu-section">
            <header>
                <h1>upload video</h1>
                <button type="button" onClick={() => navigate("/videos/watch", { replace: true })}>Return</button>
            </header>
            <main>
                <form className="upload-video-form" onSubmit={uploadVideo}>
                    <label htmlFor="video-name">video name:</label>
                    <input id="video-name" type="text" placeholder="name, (0-9), 32 max length"/>

                    <label htmlFor="video-avatar">video avatar:</label>
                    <input id="video-avatar" type="file" accept="image/*" onChange={
                        (event) => onVideoFilesChanged("image", event)
                    }/>

                    <label htmlFor="video-file">video file:</label>
                    <input id="video-file" type="file" accept="video/*" onChange={
                        (event) => onVideoFilesChanged("video", event)
                    }/>

                    <button type="submit">Upload</button>
                </form>
            </main>
        </section>
    )
}