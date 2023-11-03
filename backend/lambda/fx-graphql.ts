import { AppSyncResolverEvent, AppSyncResolverHandler, Context, Callback } from 'aws-lambda'

/**
 *        NOT IMPLEMENTED   
 */
export const handler: AppSyncResolverHandler<any, any, any> = async (event: AppSyncResolverEvent<any, any>, context: Context, callback: Callback) => {
  console.log(event.info.fieldName, '---', event.arguments)
  console.log('user', (event.identity as any))
  const user = (event.identity as any).sub

  const resolve = (data: any) => {
    callback(null, data)
  }
  const reject = (error: string) => {
    callback(error)
  }

  //  NOT IMPLEMENTED   
  const args = event.arguments;
  switch (event.info.fieldName) {
    case 'getFiles': resolve({ ok: 1, query: "getFiles" }); break;
    case 'getUrl': resolve({ ok: 1, query: "getUrl" }); break;
    default: reject('unknown query'); break;
  }
}