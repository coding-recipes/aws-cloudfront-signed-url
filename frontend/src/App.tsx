import { useEffect, useState } from 'react';
import axios from 'axios'
import { Panel, Loading, Row, ListElement, ImagePreview, ImageLink } from './Components'
import './App.css'
const REST_API_URL = import.meta.env.VITE_REST_API_URL;
const REPO_URL = import.meta.env.VITE_REPO_URL;

interface State {
  files: string[],
  currFile: string,
  currUrl: string,
  listLoading: boolean,
  currLoading: boolean,
}

export const App = () => {
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
