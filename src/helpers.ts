export async function genericAsyncFunction(func: any, args: any /**, logger: any*/) {
  // if(logger) logger(`Method: ${func.name}\n${JSON.stringify(args)}`)

  try {
    const result = await func(...args)
    return result
  } catch (error) {
    console.error(`ERROR: ${JSON.stringify(error.message, null, 4)}`)
  }
}