import React, { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css'
const REST_API_URL = import.meta.env.VITE_REST_API_URL;
const REPO_URL = import.meta.env.VITE_REPO_URL;

function Panel({ children }: { children: React.ReactNode }) {
  return <div className='panel'>
    <div className='panel_content'>
      {children}
    </div>
  </div>
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className='row'>{children}</div>
}

function ListElement({ file, selectFile, currFile }: { file: string, selectFile: (file: string) => void, currFile: string }) {
  return <div
    className={'file' + (currFile === file ? ' selected' : '')}
    onClick={() => selectFile(file)}
  >
    {file}
  </div>
}

function ImagePreview({ url }: { url: string }) {
  const [src, setSrc] = useState("")

  useEffect(() => {
    const image = new Image()
    image.src = url
    image.onload = () => {
      setSrc(url)
    }
  }, [url])

  return <div className='image_container'>
    {src && <a href={src} target='_blank'><img src={src} alt={src} /></a>}
  </div>
}

function ImageLink({ url }: { url: string }) {
  return <div className='image_link' >
    <textarea value={url} rows={10} disabled ></textarea>
    <a className='cover' href={url} target="_blank"></a>
  </div>
}

function App() {
  const [files, setFiles] = useState<string[]>([])
  const [currFile, setCurrFile] = useState<string>('')
  const [currUrl, setCurrUrl] = useState<string>('')

  const getFiles = async () => {
    setFiles([]);
    setCurrFile("");
    setCurrUrl("");
    const response = await axios.get(`${REST_API_URL}/files`)
    setFiles(response.data?.files || [])
  }

  const selectFile = async (file: string) => {
    setCurrFile(file)
    setCurrUrl("");
    const response = await axios.get(`${REST_API_URL}/url?file=${file}`)
    setCurrUrl(response.data?.url || "")
  }

  useEffect(() => {
    getFiles()
  }, [])

  return (
    <>
      <div className='page'>
        <div className='page_content'>
          <Panel>
            <Row><h3>File List</h3></Row>
            <Row>
              <div className='filelist'>
                {files.map((file) => <ListElement key={file} {...{ file, selectFile, currFile }} />)}
              </div>
            </Row>
          </Panel >

          <Panel>
            <div className='fileview'>
              <div className='title'>{currFile}</div>
              <ImagePreview url={currUrl} />
              <ImageLink url={currUrl} />
            </div>
          </Panel >
        </div >

        {REPO_URL && <a className='repo-link' href={REPO_URL} target="_blank">{REPO_URL}</a>}

      </div >
    </>
  )
}

export default App
