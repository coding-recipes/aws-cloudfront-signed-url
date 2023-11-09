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

function Loading() {
  return <div className='spinner_container'>
    <svg xmlns="http://www.w3.org/2000/svg" className="spinner" viewBox="0 0 50 50">
      <circle className="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" ></circle>
    </svg>
  </div>
}

function Row({ children, minHeight }: { children: React.ReactNode, minHeight?: number }) {
  return <div className='row' style={{ minHeight }}>{children}</div>
}

function ListElement({ file, selectFile, currFile }: { file: string, selectFile: (file: string) => void, currFile: string }) {
  return <div
    className={'file' + (currFile === file ? ' selected' : '')}
    onClick={() => selectFile(file)}
  >
    {file}
  </div>
}

function ImagePreview({ url, onFileLoaded }: { url: string, onFileLoaded: VoidFunction }) {
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

function ImageLink({ url }: { url: string }) {
  return <div className='image_link' >
    <textarea value={url} rows={10} disabled ></textarea>
    <a className='cover' href={url} target="_blank"></a>
  </div>
}

interface State {
  files: string[],
  currFile: string,
  currUrl: string,
  listLoading: boolean,
  currLoading: boolean,
}

function App() {
  const [state, _setState] = useState<State>({
    files: [],
    currFile: "",
    currUrl: "",
    listLoading: false,
    currLoading: false,
  })
  const setState = (newState: Partial<State>) => {
    _setState({ ...state, ...newState })
  }

  const getFiles = async () => {
    setState({ files: [], currFile: "", currUrl: "", listLoading: true, currLoading: false })
    const response = await axios.get(`${REST_API_URL}/files`, { validateStatus: () => true })
    setState({ files: response.data?.files || [], listLoading: false })
  }

  const selectFile = async (file: string) => {
    setState({ currFile: "", currUrl: "", currLoading: false })
    const response = await axios.get(`${REST_API_URL}/url?file=${file}`, { validateStatus: () => true })
    setState({ currUrl: response.data?.url || "" })
  }

  const onFileLoaded = () => {
    setState({ currLoading: false })
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
              {
                state.listLoading
                  ? <Row minHeight={200}><Loading /></Row>
                  : <div className='filelist'>
                    {state.files.map((file) => <ListElement key={file} {...{ file, selectFile, currFile: state.currFile }} />)}
                  </div>
              }
            </Row>
          </Panel >

          <Panel>
            <div className='fileview'>
              <div className='title'>{state.currFile}</div>
              <ImagePreview url={state.currUrl} onFileLoaded={onFileLoaded} />
              <ImageLink url={state.currUrl} />
            </div>
          </Panel >
        </div >

        {REPO_URL && <a className='repo-link' href={REPO_URL} target="_blank">{REPO_URL}</a>}

      </div >
    </>
  )
}

export default App
