import { useState, useRef } from 'react';
import { importApi } from '../../services/api';
import { Upload, FileText, Link as LinkIcon, Code, Terminal, CheckCircle, AlertCircle } from 'lucide-react';

type ImportMethod = 'file' | 'text' | 'sheets' | 'api';

export default function ImportPage() {
  const [method, setMethod] = useState<ImportMethod>('file');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [csvData, setCsvData] = useState('');
  const [apiData, setApiData] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await importApi.uploadFile(formData);
      setResult(data.data);
    } catch (err: any) { setResult({ error: err.response?.data?.error || 'Error al importar' }); }
    setLoading(false);
  };

  const handleTextImport = async () => { setLoading(true); try { const { data } = await importApi.importText({ text }); setResult(data.data); } catch (err: any) { setResult({ error: err.response?.data?.error || 'Error' }); } setLoading(false); };

  const handleSheetsImport = async () => { setLoading(true); try { const { data } = await importApi.importGoogleSheets({ csvData }); setResult(data.data); } catch (err: any) { setResult({ error: err.response?.data?.error || 'Error' }); } setLoading(false); };

  const handleAPIImport = async () => { setLoading(true); try { const parsed = JSON.parse(apiData); const { data } = await importApi.importAPI({ data: parsed }); setResult(data.data); } catch (err: any) { setResult({ error: err.message?.includes('JSON') ? 'JSON inválido' : (err.response?.data?.error || 'Error') }); } setLoading(false); };

  const methods = [
    { id: 'file' as ImportMethod, icon: Upload, label: 'Archivo', desc: 'Excel, CSV, PDF, Word, JSON, XML, TXT' },
    { id: 'text' as ImportMethod, icon: Terminal, label: 'Texto', desc: 'Copiar y pegar direcciones' },
    { id: 'sheets' as ImportMethod, icon: LinkIcon, label: 'Google Sheets', desc: 'Importar desde Google Sheets' },
    { id: 'api' as ImportMethod, icon: Code, label: 'API REST', desc: 'Importar desde API externa' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Importar Direcciones</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {methods.map(m => (
          <button key={m.id} onClick={() => { setMethod(m.id); setResult(null); }} className={`card text-left hover:bg-dark-700 transition-all ${method === m.id ? 'ring-2 ring-primary-500' : ''}`}>
            <m.icon size={24} className="text-primary-400 mb-2" />
            <p className="font-medium text-sm">{m.label}</p>
            <p className="text-xs text-dark-400 mt-1">{m.desc}</p>
          </button>
        ))}
      </div>

      <div className="card">
        {method === 'file' && (
          <div className="text-center py-8">
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx,.xls,.csv,.txt,.json,.xml,.pdf,.doc,.docx" />
            <Upload size={48} className="text-dark-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Selecciona un archivo</p>
            <p className="text-sm text-dark-400 mb-4">Excel, CSV, TXT, PDF, Word, JSON, XML</p>
            <button onClick={() => fileRef.current?.click()} className="btn-primary" disabled={loading}>{loading ? 'Importando...' : 'Seleccionar archivo'}</button>
          </div>
        )}

        {method === 'text' && (
          <div><textarea className="input-field font-mono text-sm" rows={8} placeholder="Pega las direcciones aquí&#10;Calle 1, Ciudad, Estado&#10;Calle 2, Ciudad, Estado&#10;..." value={text} onChange={e => setText(e.target.value)} /><button onClick={handleTextImport} className="btn-primary mt-3" disabled={loading || !text}>{loading ? 'Importando...' : 'Importar direcciones'}</button></div>
        )}

        {method === 'sheets' && (
          <div><textarea className="input-field font-mono text-sm" rows={8} placeholder="Pega los datos CSV de Google Sheets aquí&#10;nombre,direccion,telefono&#10;..." value={csvData} onChange={e => setCsvData(e.target.value)} /><button onClick={handleSheetsImport} className="btn-primary mt-3" disabled={loading || !csvData}>{loading ? 'Importando...' : 'Importar desde Sheets'}</button></div>
        )}

        {method === 'api' && (
          <div><textarea className="input-field font-mono text-sm" rows={8} placeholder='Pega el JSON aquí&#10;[&#10;  {"address": "Calle 1", "name": "Cliente 1"},&#10;  {"address": "Calle 2", "name": "Cliente 2"}&10;]' value={apiData} onChange={e => setApiData(e.target.value)} /><button onClick={handleAPIImport} className="btn-primary mt-3" disabled={loading || !apiData}>{loading ? 'Importando...' : 'Importar desde API'}</button></div>
        )}
      </div>

      {result && (
        <div className={`card ${result.error ? 'border-red-500/30' : 'border-green-500/30'}`}>
          {result.error ? (
            <div className="flex items-center gap-3 text-red-400"><AlertCircle size={20} /><span>{result.error}</span></div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-green-400"><CheckCircle size={20} /><span className="font-medium">Importación completada</span></div>
              <p className="text-sm text-dark-300">Total: {result.total} direcciones</p>
              <p className="text-sm text-green-400">Geocodificadas: {result.geocoded}</p>
              {result.failed > 0 && <p className="text-sm text-red-400">Fallaron: {result.failed}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
