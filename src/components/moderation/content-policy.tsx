import { AlertTriangle, Shield, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ContentPolicy() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Content Policy & Guidelines
        </CardTitle>
        <CardDescription>
          BugPin uses automated content moderation to maintain a safe, professional environment for sharing coding errors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            All images are analyzed locally in your browser using AI before upload. No images are sent to third parties for moderation.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h3 className="font-semibold text-green-700">✅ Acceptable Content</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
            <li>Screenshots of coding errors, bugs, and technical issues</li>
            <li>IDE screenshots showing error messages</li>
            <li>Terminal/console output with errors</li>
            <li>Browser developer tools screenshots</li>
            <li>Code editor screenshots with syntax errors</li>
            <li>Stack traces and error logs</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-red-700">❌ Prohibited Content</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
            <li>Explicit, sexual, or adult content</li>
            <li>Inappropriate or suggestive imagery</li>
            <li>Content that violates professional standards</li>
            <li>Images unrelated to coding or technical issues</li>
            <li>Personal photos or non-technical screenshots</li>
          </ul>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>False Positive?</strong> If your coding screenshot was incorrectly blocked, please ensure it clearly shows technical content. 
            The AI occasionally misidentifies complex UI elements or certain color patterns.
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-medium mb-2">How Content Moderation Works</h4>
          <p className="text-sm text-muted-foreground">
            We use NSFWJS, an open-source AI model that runs entirely in your browser. 
            It analyzes images for inappropriate content with ~90% accuracy. 
            This protects the community while keeping your images private.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ContentPolicyLink() {
  return (
    <p className="text-xs text-muted-foreground text-center">
      By uploading, you agree to our{' '}
      <button className="underline hover:text-foreground" onClick={() => {
        // This could open a modal or navigate to a policy page
        window.open('/content-policy', '_blank')
      }}>
        Content Policy
      </button>
    </p>
  )
}