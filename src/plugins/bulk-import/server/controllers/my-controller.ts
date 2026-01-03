export default ({ strapi }) => ({
    index(ctx) {
        ctx.body = strapi
            .plugin('bulk-import')
            .service('myService')
            .getWelcomeMessage();
    },

    async processUploads(ctx) {
        const { fileIds } = ctx.request.body;

        if (!Array.isArray(fileIds) || fileIds.length === 0) {
            return ctx.badRequest('No file IDs provided');
        }

        try {
            const createdAssets = [];

            for (const fileId of fileIds) {
                // 1. Obtener info del archivo subido
                const fileInfo = await strapi.entityService.findOne('plugin::upload.file', fileId);

                if (!fileInfo) continue;

                // 2. Determinar tipo
                let assetType = 'other';
                const mime = fileInfo.mime || '';
                if (mime.startsWith('image/')) assetType = 'image';
                else if (mime.startsWith('video/')) assetType = 'video';
                else if (mime === 'application/pdf') assetType = 'document';
                else if (mime.includes('spreadsheet') || mime.includes('csv') || mime.includes('excel')) assetType = 'document';

                // 3. Crear Asset
                const newAsset = await strapi.entityService.create('api::asset.asset', {
                    data: {
                        title: fileInfo.name,
                        description: `Importado masivamente. Tipo original: ${mime}`,
                        file: fileId,
                        type: assetType,
                        metadata: {
                            size: fileInfo.size,
                            ext: fileInfo.ext,
                            mime: mime
                        },
                        publishedAt: new Date() // Publicar inmediatamente
                    }
                });

                createdAssets.push(newAsset);
            }

            ctx.body = {
                message: 'Assets created successfully',
                count: createdAssets.length,
                assets: createdAssets
            };

        } catch (err) {
            ctx.throw(500, err);
        }
    }
});
