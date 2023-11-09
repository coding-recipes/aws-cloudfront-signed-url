import React, { useEffect, useState } from 'react';

export const Panel = ({ children }: { children: React.ReactNode }) => {
  return <div className='panel'>
    <div className='panel_content'>
      {children}
    </div>
  </div>
}

export const Loading = () => {
  return <div className='spinner_container'>
    <svg xmlns="http://www.w3.org/2000/svg" className="spinner" viewBox="0 0 50 50">
      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" ></circle>
    </svg>
  </div>
}

export const Row = ({ children, minHeight }: { children: React.ReactNode, minHeight?: number }) => {
  return <div className='row' style={{ minHeight }}>{children}</div>
}

export const ListElement = ({ file, selectFile, currFile }: { file: string, selectFile: (file: string) => void, currFile: string }) => {
  return <div
    className={'file' + (currFile === file ? ' selected' : '')}
    onClick={() => selectFile(file)}
  >
    {file}
  </div>
}

export const ImagePreview = ({ url, onFileLoaded }: { url: string, onFileLoaded: VoidFunction }) => {
  const [src, setSrc] = useState("")

  useEffect(() => {
    setSrc("")
    const image = new Image()
    image.src = url
    image.onload = () => {
      onFileLoaded()
      setSrc(url)
    }
  }, [url])

  return <div className='image_container'>
    {url && !src && <Loading />}
    {src && <a href={src} target='_blank'><img src={src} alt={src} /></a>}
  </div>

}

export const ImageLink = ({ url }: { url: string }) => {
  return <div className='image_link' >
    <textarea value={url} rows={10} disabled ></textarea>
    <a className='cover' href={url} target="_blank"></a>
  </div>
}