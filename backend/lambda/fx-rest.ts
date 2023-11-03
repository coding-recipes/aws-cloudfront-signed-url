import { APIGatewayEvent, Context, Callback } from 'aws-lambda'
import { getFiles, getUrl, getPrivateKey, apiGtwResponse } from './utils'

let PRIVATE_KEY: string

export const handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const { path, queryStringParameters } = event
  switch (path) {
    case "/files":
      const files = await getFiles()
      return apiGtwResponse({ req: { path }, files })

    case "/url":
      const { file } = queryStringParameters || {}
      if (!file) return apiGtwResponse({ req: { path }, error: "missing 'file' query parameter" }, 400)

      if (!PRIVATE_KEY) {
        PRIVATE_KEY = await getPrivateKey()
      }
      const url = await getUrl(file, PRIVATE_KEY);
      return apiGtwResponse({ req: { path }, url })

    default:
      return apiGtwResponse({ req: { path }, error: "use 'files' or 'url' routes" }, 403)
  }

}