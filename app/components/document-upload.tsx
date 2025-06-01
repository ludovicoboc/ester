"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, X } from "lucide-react"

interface DocumentUploadProps {
  documents: string[]
  onDocumentsChange: (documents: string[]) => void
}

export default function DocumentUpload({ documents, onDocumentsChange }: DocumentUploadProps) {
  const [newDocument, setNewDocument] = useState("")

  const addDocument = () => {
    if (newDocument.trim()) {
      onDocumentsChange([...documents, newDocument.trim()])
      setNewDocument("")
    }
  }

  const removeDocument = (index: number) => {
    onDocumentsChange(documents.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="w-5 h-5" />
          Documentos de Referência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Adicionar Documento (Cole o texto)</label>
          <Textarea
            placeholder="Cole aqui o conteúdo do documento que deseja usar como referência..."
            value={newDocument}
            onChange={(e) => setNewDocument(e.target.value)}
            rows={4}
            className="w-full"
          />
          <Button onClick={addDocument} disabled={!newDocument.trim()} className="mt-2" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Adicionar Documento
          </Button>
        </div>

        {documents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Documentos Adicionados ({documents.length})</h4>
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 mt-1 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{doc.substring(0, 100)}...</p>
                  </div>
                  <Button onClick={() => removeDocument(index)} variant="ghost" size="sm" className="flex-shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
