import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    GridLayout,
    TextInput,
    Alert,
    ProgressBar
} from '@strapi/design-system';
import { Upload } from '@strapi/icons';
// import { useFetchClient } from '@strapi/helper-plugin'; // Strapi v5 usa hooks nuevos, usaremos fetch nativo o axios si está disponible

const HomePage = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState(null); // { type: 'success' | 'danger', message: string }

    const handleFileChange = (e) => {
        // Convertir FileList a Array
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setStatus(null);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setProgress(0);

        // Obtenemos el token del localStorage (Strapi Admin lo guarda ahí)
        const token = sessionStorage.getItem('jwtToken') || localStorage.getItem('jwtToken');

        try {
            // 1. Subir archivos al endpoint de Upload estándar de Strapi
            const formData = new FormData();

            files.forEach((file) => {
                formData.append('files', file);
            });

            // Simular progreso (ya que fetch no tiene onUploadProgress nativo simple)
            const interval = setInterval(() => {
                setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
            }, 500);

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!uploadResponse.ok) throw new Error('Error subiendo archivos iniciales.');

            const uploadedFiles = await uploadResponse.json();

            clearInterval(interval);
            setProgress(100);

            // 2. Crear Assets para cada archivo subido
            // Esto lo haremos uno por uno o en lote llamando a nuestro plugin
            // Por simplicidad, aquí llamaremos a un endpoint personalizado de nuestro plugin 'bulk-import'
            // que se encarga de "convertir" esos uploads en Assets del DAM.

            const assetCreationResponse = await fetch('/bulk-import/process-uploads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ fileIds: uploadedFiles.map(f => f.id) })
            });

            if (!assetCreationResponse.ok) throw new Error('Error creando Assets en el DAM.');

            setStatus({ type: 'success', message: `¡Éxito! Se han importado ${uploadedFiles.length} activos al DAM.` });
            setFiles([]);

        } catch (error) {
            console.error(error);
            setStatus({ type: 'danger', message: `Ocurrió un error: ${error.message}` });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box padding={8} background="neutral100">
            <Box padding={6} background="neutral0" shadow="filterShadow" hasRadius>
                <Typography variant="alpha" as="h1">🚀 Importador Masivo DAM</Typography>

                <Box paddingTop={4} paddingBottom={4}>
                    <Typography variant="body1">
                        Selecciona múltiples imágenes, videos o documentos. El sistema detectará automáticamente el tipo y creará los Assets correspondientes.
                    </Typography>
                </Box>

                {status && (
                    <Box paddingBottom={4}>
                        <Alert closeLabel="Close" title={status.type === 'success' ? "Éxito" : "Error"} variant={status.type} onClose={() => setStatus(null)}>
                            {status.message}
                        </Alert>
                    </Box>
                )}

                <Box
                    padding={8}
                    borderStyle="dashed"
                    borderWidth="2px"
                    borderColor="neutral200"
                    background="neutral100"
                    hasRadius
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="file-input"
                    />
                    <label htmlFor="file-input" style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                        <Upload width="3rem" height="3rem" fill="neutral500" />
                        <Box paddingTop={2}>
                            <Typography variant="delta" textColor="neutral600">
                                {files.length > 0 ? `${files.length} archivos seleccionados` : "Haz click o arrastra archivos aquí"}
                            </Typography>
                        </Box>
                    </label>
                </Box>

                {files.length > 0 && (
                    <Box paddingTop={4}>
                        <Typography variant="pi" fontWeight="bold">Archivos listos para subir:</Typography>
                        <Box as="ul" style={{ listStyle: 'disc', paddingLeft: '20px', maxHeight: '100px', overflowY: 'auto' }}>
                            {files.map((f, i) => (
                                <li key={i}><Typography variant="omega">{f.name} ({Math.round(f.size / 1024)} KB)</Typography></li>
                            ))}
                        </Box>
                    </Box>
                )}

                {uploading && (
                    <Box paddingTop={4}>
                        <ProgressBar value={progress}>Subiendo y procesando...</ProgressBar>
                    </Box>
                )}

                <Box paddingTop={6} display="flex" justifyContent="flex-end">
                    <Button
                        onClick={handleUpload}
                        disabled={uploading || files.length === 0}
                        startIcon={<Upload />}
                        size="L"
                    >
                        {uploading ? 'Procesando...' : 'Iniciar Importación al DAM'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default HomePage;
