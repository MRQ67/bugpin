declare module 'tesseract.js' {
  export interface WorkerOptions {
    // Add fields you need; kept loose for now
    // logger?: (m: any) => void
  }
  const Tesseract: any
  export default Tesseract
  export { Tesseract }
}
