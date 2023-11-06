import { AppSyncResolverEvent, AppSyncResolverHandler, Context, Callback } from 'aws-lambda'
import { getFiles, getUrl, getPrivateKey } from './utils'

let PRIVATE_KEY: string

export const handler: AppSyncResolverHandler<any, any, any> = async (event: AppSyncResolverEvent<any, any>, context: Context, callback: Callback) => {
  const resolve = (data: any) => {
    callback(null, data)
  }
  const reject = (error: string) => {
    callback(error)
  }

  const args = event.arguments;
  switch (event.info.fieldName) {
    case 'getFiles':
      const files = await getFiles()
      resolve(files);
      break;
    case 'getUrl':
      const { file } = args as { file: string };
      if (!PRIVATE_KEY) {
        PRIVATE_KEY = await getPrivateKey()
      }
      var url = await getUrl(file, PRIVATE_KEY);
      resolve(url);
      break;
    default: reject('unknown query'); break;
  }
}