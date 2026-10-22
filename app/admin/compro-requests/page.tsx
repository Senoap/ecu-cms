// app/admin/compro-requests/page.tsx
import { readDB, defaultComproEmailTemplate } from '@/lib/db'
import { requirePagePermission } from '@/lib/auth'
import ComproRequestsClient from '@/app/admin/compro-requests/ComproRequestsClient'
import { 
  resendComproEmailAction, 
  updateComproStatusAction, 
  deleteComproRequestAction, 
  saveComproTemplateAction,
  uploadComproPdfAction,
  getComproPdfInfoAction,
  getSmtpStatusAction,
  testSmtpAction
} from '@/app/actions/compro'

export default async function AdminComproRequestsPage() {
  await requirePagePermission('compro-requests')
  const db = await readDB()

  const requests = db.comproRequests || []
  const template = db.comproEmailTemplate || defaultComproEmailTemplate
  const pdfInfo = await getComproPdfInfoAction()
  const smtpStatus = await getSmtpStatusAction()

  return (
    <ComproRequestsClient
      requests={requests}
      template={template}
      pdfInfo={pdfInfo}
      smtpStatus={smtpStatus}
      resendEmailAction={resendComproEmailAction}
      updateStatusAction={updateComproStatusAction}
      deleteRequestAction={deleteComproRequestAction}
      saveTemplateAction={saveComproTemplateAction}
      uploadPdfAction={uploadComproPdfAction}
      testSmtpAction={testSmtpAction}
    />
  )
}
